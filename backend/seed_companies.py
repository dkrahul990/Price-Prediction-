import requests
import random

def generate_companies():
    names_medical = ["Aetna", "Blue Cross", "Cigna", "Humana", "Kaiser", "UnitedHealth", "Anthem", "Centene", "Molina", "Oscar",
                     "Health Net", "Medica", "Highmark", "CareSource", "Assurant", "AvMed", "Geisinger", "Priority Health", "WellCare", "EmblemHealth", "HealthPartners"]
    names_life = ["MetLife", "Prudential", "New York Life", "MassMutual", "Lincoln Financial", "Northwestern Mutual", "State Farm", "Transamerica", "AIG", "Mutual of Omaha",
                  "Pacific Life", "Guardian Life", "John Hancock", "Nationwide", "Thrivent", "Symetra", "Protective Life", "Penn Mutual", "Securian", "Equitable"]

    adjectives = ["Plus", "Shield", "Care", "Secure", "Trust", "Prime", "Elite", "Guardian", "Allied", "Protect", "Core", "Max", "Advanced"]
    
    desc_medical = [
        "Offers expansive medical coverage for emergencies and everyday health needs.",
        "A premium plan containing world-class out-patient coverage networks.",
        "Affordable healthcare solution that scales with your growing medical demands.",
        "Your trusted partner in hospital inpatient care and specialist visit deductions.",
        "State-of-the-art telehealth integrated health insurance for the modern family."
    ]
    
    desc_life = [
        "Reliable term-life assurance designed to protect your family's future.",
        "Whole life insurance with cash-value generation and flexible premiums.",
        "Robust life safety net protecting your legacy in case of extreme tragedies.",
        "Premium life coverage tailored specifically for high-net-worth individuals.",
        "Affordable life insurance suitable for young families and newly weds."
    ]

    companies = []
    
    # 25 Medical Companies, spreading base coverage prices
    base_charge_tracker = 2500
    for i in range(25):
        name = f"{random.choice(names_medical)} {random.choice(adjectives)}"
        companies.append({
            "name": name,
            "insurance_type": "Medical",
            "base_charge": base_charge_tracker + random.randint(-500, 1000),
            "rating": round(random.uniform(3.0, 5.0), 1),
            "description": random.choice(desc_medical),
            "terms": "Standard medical terms and conditions apply. Pre-existing conditions undergo an initial 6-month holding period before coverage is active. Deductibles vary per region."
        })
        base_charge_tracker += 2000

    # 25 Life Companies
    base_charge_tracker = 4000
    for i in range(25):
        name = f"{random.choice(names_life)} {random.choice(adjectives)}"
        companies.append({
            "name": name,
            "insurance_type": "Life",
            "base_charge": base_charge_tracker + random.randint(-1500, 1500),
            "rating": round(random.uniform(3.5, 5.0), 1),
            "description": random.choice(desc_life),
            "terms": "Term and Whole life conditions apply. Premium adjustments based on preliminary health checks. Non-payment invalidates claim within 90 days."
        })
        base_charge_tracker += 3000

    for company in companies:
        try:
            res = requests.post("http://127.0.0.1:5001/companies", json=company)
            print(f"Added {company['name']} - ${company['base_charge']}")
        except Exception as e:
            print("Failed", e)

if __name__ == "__main__":
    generate_companies()
