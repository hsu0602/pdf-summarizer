import sys
import io
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
model_name = "taide/Llama3-TAIDE-LX-8B-Chat-Alpha1"
#model_name = "meta-llama/Llama-3.2-3B-Instruct"

quantization_config = BitsAndBytesConfig(load_in_4bit=True, 
                                         bnb_4bit_quant_type="nf4", 
                                         bnb_4bit_compute_dtype="float16", 
                                         bnb_4bit_use_double_quant=True)

tokenizer =  AutoTokenizer.from_pretrained(model_name)

terminators = [
    tokenizer.eos_token_id,
    tokenizer.convert_tokens_to_ids("<|eot_id|>")
]

txtGen = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config = quantization_config,
    device_map = "auto",
)

def summarize(input_text):
    
    messages = [ {"role": "system", "content": "你是一個摘要小幫手，給你任何語言的輸入文本，請依據文本以中文生成約150字的摘要(專有名詞可以使用原文，或於中文後括號以原文注釋)"}, {"role": "user", "content": input_text} ]
    
    input_ids = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to(txtGen.device)
    
        
    with torch.no_grad():
        result = txtGen.generate(
            input_ids,
            max_new_tokens=256,
            pad_token_id = tokenizer.eos_token_id,
            eos_token_id=terminators,
            do_sample=True, 
            temperature=0.6, 
            top_p=0.5, 
        )
    summary = tokenizer.decode(result[0][input_ids.shape[-1]:], skip_special_tokens=True)
    return(summary)

def sliding_window_summarize(input_text, max_length=30000, overlap=300):
    
    chunks = []
    start = 0
    text_length = len(input_text)
    #print(text_length)
    while start < text_length:
        end = min(start + max_length, text_length)
        chunks.append(input_text[start:end])
        start += (max_length - overlap)
    
    summaries = [summarize(chunk) for chunk in chunks]

    final_summary = summarize(' '.join(summaries))
    return final_summary


def safe_print(text):
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode('utf-8', errors='ignore').decode('utf-8'))

def remove_references(text):
    import re
    section_markers = [
        r'\bReferences\b',
        r'\bREFERENCES\b',
        r'\bReference\b',
        r'\bREFERENCE\b',
        r'\bBibliography\b',
        r'\bAppendix\b',
        r'\bAcknowledgments\b',
        r'\bAcknowledgements\b',
    ]
    pattern = re.compile('|'.join(section_markers), re.IGNORECASE)
    
    matches = list(pattern.finditer(text))
    if matches:
        last_match = matches[-1]
        position = last_match.start()
        return text[:position]
    else:
        return text

def remove_incomplete_sentence(text):
    pattern = re.compile(r'.*?[。！？?]')
    matches = pattern.findall(text)
    
    if matches:
        return ''.join(matches)
    else:
        return text

if __name__ == "__main__":
    input_text = sys.argv[1]
    input_text = remove_references(input_text)
    print(remove_incomplete_sentence(sliding_window_summarize(input_text)))
    







