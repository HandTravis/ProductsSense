from dotenv import load_dotenv
import os
import requests
from transformers import pipeline
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OctoAIEmbeddings
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import Document  # Import Document
import torch

# Load environment variables
load_dotenv()
OCTOAI_API_TOKEN = os.environ.get("OCTOAI_API_TOKEN")
RAINFOREST_API_KEY = os.environ.get("RAINFOREST_API_KEY")

# Check if environment variables are loaded
if not RAINFOREST_API_KEY:
    raise ValueError("RAINFOREST_API_KEY is not set in the environment variables.")
if not OCTOAI_API_TOKEN:
    raise ValueError("OCTOAI_API_TOKEN is not set in the environment variables.")

os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Function to fetch product information using Rainforest API with pagination
def fetch_products(query, num_pages=1):
    url = "https://api.rainforestapi.com/request"
    products = {}
    for page in range(1, num_pages + 1):
        params = {
            "api_key": RAINFOREST_API_KEY,
            "amazon_domain": "amazon.com",
            "type": "search",
            "search_term": query,
            "page": page
        }
        response = requests.get(url, params=params)
        data = response.json()
        for product in data.get("search_results", []):
            title = product.get("title", "")
            if title not in products:  # Ensure unique titles
                products[title] = product
        if "search_results" not in data:
            break  # No more results, exit loop
    return products

# Example query for microwaves
query = "microwave"
products_info = fetch_products(query, num_pages=3)  # Fetch results from 3 pages

# Extract and process the product information
texts = []
for product in products_info.values():
    title = product.get("title", "")
    features = " ".join(product.get("feature_bullets", []))
    texts.append(title + "\n" + features)

# Combine all product texts into one
text = "\n\n".join(texts)

# Check extracted text
print("Extracted Text Length:", len(text))

# Load summarization pipeline
device = 0 if torch.cuda.is_available() else -1
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=device)

# Function to split text into chunks
def split_text_into_chunks(text, max_length, tokenizer):
    tokens = tokenizer(text, truncation=True, return_tensors="pt", max_length=max_length).input_ids[0]
    chunk_size = max_length - 2  # Leave room for special tokens
    for i in range(0, len(tokens), chunk_size):
        yield tokenizer.decode(tokens[i:i + chunk_size], skip_special_tokens=True)

# Get tokenizer for the model
tokenizer = summarizer.tokenizer

# Split text into chunks
text_chunks = list(split_text_into_chunks(text, 1024, tokenizer))

# Summarize each chunk
summaries = []
for chunk in text_chunks:
    input_length = len(tokenizer(chunk).input_ids)
    max_length = min(input_length, 150)
    min_length = max(1, min(30, max_length - 1))
    summary = summarizer(chunk, max_length=max_length, min_length=min_length, do_sample=False)
    summaries.append(summary[0]['summary_text'])

# Combine summaries
summarized_text = ' '.join(summaries)

# Check summarized text
print("Summarized Text Length:", len(summarized_text))

# Wrap the summarized text in a Document-like structure
summarized_document = Document(page_content=summarized_text)

chunk_size = 8192
chunk_overlap = 128
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size,
    chunk_overlap=chunk_overlap,
)

# Split summarized text
splits = text_splitter.split_documents([summarized_document])

# Check splits
print("Number of Splits:", len(splits))

# Initialize LLM and embeddings
llm = OctoAIEndpoint(
    model_kwargs={"model": "mixtral-8x7b-instruct"},
    max_tokens=8192,
    presence_penalty=0,
    temperature=0.1,
    top_p=0.9,
)
embeddings = OctoAIEmbeddings()

# Create vector store
vector_store = FAISS.from_documents(
    splits,
    embedding=embeddings
)

retriever = vector_store.as_retriever()

# Define prompt template
template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context} 
Answer:"""
prompt = ChatPromptTemplate.from_template(template)

# Create the chain
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Invoke the chain with a question
result = chain.invoke("What is the summary of this information?")
print(result)
