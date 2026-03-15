import os
from PIL import Image, ImageDraw, ImageFont

# Ensure target directory exists (though we can just put them on Desktop or in backend/)
output_dir = r"C:\Users\ASUS\Desktop\test_documents"
os.makedirs(output_dir, exist_ok=True)

def create_image(filename, text_content):
    # Create a white image
    img = Image.new('RGB', (800, 400), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    # Optional: try to load a default font
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except IOError:
        font = ImageFont.load_default()
        
    d.text((50, 50), text_content, fill=(0, 0, 0), font=font)
    
    path = os.path.join(output_dir, filename)
    img.save(path)
    print(f"Created {path}")

# Document 1: Income Certificate
text1 = """DOCUMENT TYPE: INCOME CERTIFICATE (TEST)

Name: Sunita Devi
Date of Birth: 12/08/1980
Address: Village Rampura, Raipur
Income Category: BPL
Certificate ID: INC-33482"""
create_image("income_certificate.png", text1)

# Document 2: Identity Card (Aadhaar equivalent)
text2 = """DOCUMENT TYPE: IDENTITY CARD (TEST)

Name: Sunita Devi
Date of Birth: 12-08-1980
Address: Village Rampur, Raipur, Chhattisgarh
Gender: Female
ID Number: ID-45873921"""
create_image("identity_card.png", text2)

# Document 3: Household Card (Ration Card equivalent)
text3 = """DOCUMENT TYPE: HOUSEHOLD CARD (TEST)

Head of Family: Ram Lal
Member Name: Sunita Debi
Relationship: Wife
Address: Village Rampur, Raipur
Income Category: BPL
Card Number: HC-908172"""
create_image("household_card.png", text3)
