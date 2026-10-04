/**
 * Process guides (renting, landlord and tax). Every legal or numeric statement here comes from the
 * official source listed in `sources` and was checked on the date in `updatedLabel`.
 */
import type { QuestionGuide } from "./question-guides.ts";

const UPDATED_LABEL = "3 October 2026";
const UPDATED_ISO = "2026-10-03";

const LAW_NOTICE =
  "General information, not legal advice. It is based on the laws and official pages listed under Sources, checked on 3 October 2026. Procedures and forms can change, so follow the official portal or office for your case.";

const SRC = {
  punjabTrs: { label: "Punjab Police — Tenant Registration System", url: "https://punjabpolice.gov.pk/trs" },
  punjabTenants: { label: "Punjab Police — Tenants Registration (OTP notice)", url: "https://punjabpolice.gov.pk/tenants" },
  punjabTrsPortal: { label: "Punjab Police — online portal trs.punjabpolice.gov.pk", url: "https://trs.punjabpolice.gov.pk/" },
  pitra2015: {
    label: "The Punjab Information of Temporary Residents Act 2015 (Act VIII of 2015), text as passed",
    url: "https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/102085/PAK102085.pdf",
  },
  sindhAct: {
    label: "The Sindh Information of Temporary Residents Act 2015 (Sindh Act XXI of 2015)",
    url: "https://www.pas.gov.pk/uploads/acts/Sindh%20Act%20No.XXI%20of%202015.pdf",
  },
  karachiPolice: {
    label: "Karachi Police — How to apply for tenant registration",
    url: "https://karachipolice.gov.pk/services/how-to-apply-for-tenant-registration-process/",
  },
  ictPolice: { label: "Islamabad Capital Territory Police — tenant registration service", url: "https://islamabadpolice.gov.pk/srv-tr.php" },
  prpa2009: { label: "The Punjab Rented Premises Act 2009 — Punjab Laws", url: "https://punjablaws.gov.pk/laws/498.html" },
  irro2001: {
    label: "Pakistan Code — Islamabad Rent Restriction Ordinance 2001",
    url: "https://pakistancode.gov.pk/pdffiles/administratorf1b125f14a9e5a6bdd4ea885926304c4.pdf",
  },
  irro2021: {
    label: "National Assembly — Islamabad Rent Restriction (Amendment) Act 2021",
    url: "https://www.na.gov.pk/uploads/documents/61c4711c139b9_755.pdf",
  },
  eStampPortal: {
    label: "Government of the Punjab — e-Stamping Citizen Portal",
    url: "https://es.punjab-zameen.gov.pk/eStampCitizenPortal/ChallanFormView/HomePage",
  },
  pitbEStamp: { label: "PITB — e-Stamping (how duty is calculated)", url: "https://www.pitb.gov.pk/estamping" },
  fbrCardPage: {
    label: "FBR — Withholding Tax Rate Cards",
    url: "https://fbr.gov.pk/withholding-taxes-rate-card/174298/174301",
  },
  fbrCard2027: {
    label: "FBR — Withholding Income Tax Rate Card, Tax Year 2027 (updated to 30 June 2026 as per Finance Act 2026), PDF",
    url: "https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf",
  },
  excise: { label: "Excise, Taxation & Narcotics Control Department Punjab — services", url: "https://excise.punjab.gov.pk/services" },
};

const POST = { href: "/post", label: "post your property free on Apna Ghar" };

const tenantRegistrationPunjab: QuestionGuide = {
  slug: "tenant-registration-punjab-police",
  title: "Tenant Registration Punjab Police: Online Steps & Documents | Apna Ghar",
  h1: "Tenant registration with Punjab Police: how to do it",
  description:
    "How to register a tenant with Punjab Police online or at a police station or Khidmat Markaz: who must do it, the 15-day deadline in the 2015 Act, documents and penalties.",
  eyebrow: "RENTING • PUNJAB",
  notice: LAW_NOTICE,
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    [
      "In Punjab, the landlord, the tenant and any property dealer involved must give the tenant’s details to the police within fifteen days of the tenant getting possession of the house, flat or portion. If one of them does it, the others are not liable. This is section 3 of the Punjab Information of Temporary Residents Act 2015.",
    ],
    [
      "Punjab Police takes registrations online through its Tenant Registration System at ",
      { href: "https://trs.punjabpolice.gov.pk/", label: "trs.punjabpolice.gov.pk", external: true },
      ", or in person at the local police station or a Police Khidmat Markaz.",
    ],
  ],
  sections: [
    {
      heading: "Who has to register the tenant, and by when",
      bullets: [
        ["Who: the property dealer, the landlord and the tenant are all responsible (section 3(1)). One registration is enough: if any one of them gives the information, the others are not liable (section 3(3))."],
        ["When: within fifteen days from the time possession is handed to the tenant (section 3(1) of the Act as passed in 2015)."],
        ["Identity check: the landlord or property dealer must not let a tenant stay without being satisfied of the tenant’s identity from their CNIC or passport, must keep a copy, and must give that copy to the police (section 5)."],
        ["What counts as rented premises: a building or part of a building let out for living in, which covers a house, a portion or a flat. Hotels and hostels have separate rules in the same Act."],
      ],
    },
    {
      heading: "How to register a tenant online",
      paragraphs: [
        [
          "Punjab Police’s own page says to use the official Tenant Registration System at ",
          { href: "https://trs.punjabpolice.gov.pk/", label: "trs.punjabpolice.gov.pk", external: true },
          ". The portal sends a one-time code (OTP) to your mobile. Enter the owner, tenant and property details it asks for, and save or screenshot any confirmation or reference it shows.",
        ],
        [
          "If the OTP does not arrive, Punjab Police says to register through the area police station, a Police Khidmat Markaz, or the Punjab Police public app instead.",
        ],
      ],
    },
    {
      heading: "How to register at a police station or Khidmat Markaz",
      paragraphs: [["Punjab Police lists these for in-person registration. The official there enters the data:"]],
      bullets: [
        ["Copies of the CNICs of the owner and the tenant."],
        ["Recent photographs of the owner and the tenant."],
        ["The rent agreement."],
      ],
    },
    {
      heading: "What happens if you do not register",
      paragraphs: [
        [
          "Under section 11 of the Act as passed in 2015, knowingly breaking section 3 (information to police) or section 5 (identity check) can lead to imprisonment of up to six months and a fine of not less than Rs 10,000 and not more than Rs 100,000. Section 12 makes the offence cognizable and non-bailable. Section 13 allows it to be compounded on deposit of an administrative penalty of at least Rs 10,000, unless the person was convicted or compounded before.",
        ],
        [
          "Section 7 also lets a police officer of at least Sub-Inspector rank inspect rented premises, after reasonable notice, to check compliance.",
        ],
      ],
    },
    {
      heading: "Sign the rent agreement first",
      paragraphs: [
        [
          "The in-person registration asks for the rent agreement, and Punjab’s Rented Premises Act 2009 separately requires a written tenancy agreement presented to the Rent Registrar. See the ",
          { href: "/guides/rent-agreement-format-pakistan", label: "rent agreement format for Pakistan" },
          " for the clauses to include.",
        ],
      ],
    },
    {
      heading: "Renting in Karachi or Islamabad instead?",
      bullets: [
        [
          "Sindh (including Karachi): the Sindh Information of Temporary Residents Act 2015 gives forty-eight hours from possession. Karachi Police says registration is free at the police station or a facilitation centre, needs the owner’s and tenant’s CNICs, the rent agreement, an affidavit and the tenant’s photograph, and can also be done online on the TRUST portal at tenantregister.sindhpolice.gov.pk.",
        ],
        [
          "Islamabad: the Islamabad Capital Territory Police runs its own tenant registration. Check the current documents and fee on the ",
          { href: "https://islamabadpolice.gov.pk/srv-tr.php", label: "ICT Police tenant registration page", external: true },
          ".",
        ],
      ],
    },
    {
      heading: "Have a house or portion to rent out in Punjab?",
      paragraphs: [
        [
          "Find a tenant first: ",
          POST,
          ". Renters can browse ",
          { href: "/rent/punjab/lahore", label: "rentals in Lahore" },
          ", ",
          { href: "/rent/punjab/rawalpindi", label: "Rawalpindi" },
          " and ",
          { href: "/rent/punjab/faisalabad", label: "Faisalabad" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Is tenant registration compulsory in Punjab?",
      a: ["Yes. Section 3 of the Punjab Information of Temporary Residents Act 2015 requires the landlord, tenant and property dealer to give the tenant’s information to the police."],
    },
    {
      q: "Who should register the tenant, the landlord or the tenant?",
      a: ["Either can. The landlord, the tenant and the property dealer are all responsible, but once one of them registers, the others are not liable (section 3(3))."],
    },
    {
      q: "How many days do I have to register a tenant in Punjab?",
      a: ["Fifteen days from the time the tenant gets possession, under section 3(1) of the Act as passed in 2015."],
    },
    {
      q: "What documents do I need for tenant registration in Punjab?",
      a: ["For in-person registration Punjab Police lists copies of the owner’s and tenant’s CNICs, recent photographs of both, and the rent agreement."],
    },
    {
      q: "What if the OTP does not come on the Punjab Police tenant portal?",
      a: ["Punjab Police says to register at the area police station, a Police Khidmat Markaz or through the Punjab Police public app."],
    },
    {
      q: "What is the penalty for not registering a tenant in Punjab?",
      a: ["Section 11 of the 2015 Act provides imprisonment of up to six months and a fine of Rs 10,000 to Rs 100,000 for knowingly breaking the registration or identity-check duties."],
    },
  ],
  sources: [SRC.punjabTrs, SRC.punjabTenants, SRC.punjabTrsPortal, SRC.pitra2015, SRC.sindhAct, SRC.karachiPolice, SRC.ictPolice],
  related: [
    { href: "/guides/rent-agreement-format-pakistan", label: "Rent agreement format in Pakistan" },
    { href: "/guides/how-to-rent-out-your-house-in-pakistan", label: "How to rent out your house in Pakistan" },
    { href: "/how-to-rent-a-house-in-pakistan", label: "How to rent a house in Pakistan" },
    { href: "/guides/cities/lahore", label: "House for rent in Lahore" },
  ],
};

const rentAgreementFormat: QuestionGuide = {
  slug: "rent-agreement-format-pakistan",
  title: "Rent Agreement Format Pakistan: Clauses, E-Stamp & Registration | Apna Ghar",
  h1: "Rent agreement format in Pakistan: what to include",
  description:
    "A plain rent agreement (kirayanama) format for Pakistan: the clauses to include, e-stamp paper, the Rent Registrar in Punjab, the Controller in Islamabad, and what to do after signing.",
  eyebrow: "RENTING • AGREEMENT",
  notice: LAW_NOTICE,
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    [
      "A rent agreement (tenancy agreement, kirayanama) should record the deal you actually made: who the parties are, which property, how long, the rent and when it is paid, any deposit or advance, bills, repairs, and how the tenancy ends. Below is a clause-by-clause format you can give to a deed writer or lawyer, followed by what the law in Punjab and Islamabad adds.",
    ],
  ],
  sections: [
    {
      heading: "Rent agreement format, clause by clause",
      bullets: [
        ["1. Title and date: “Rent agreement”, the date and place of signing."],
        ["2. Parties: full names, father’s or husband’s name, CNIC numbers and addresses of the landlord and the tenant."],
        ["3. Premises: full address and what is let — for example the whole house, the upper portion, or flat number and floor — with rooms and any fixtures included."],
        ["4. Term: start date, end date or length of the tenancy, and whether it can be renewed."],
        ["5. Rent: monthly amount in figures and words, the due date, and how it is paid (bank transfer to a named account, or cash against a signed receipt)."],
        ["6. Rent increase: the agreed rate and when it applies, if any."],
        ["7. Security deposit, advance rent or pagri: each amount, when it was paid, and the conditions for returning the deposit at the end."],
        ["8. Bills and charges: who pays electricity, gas, water, internet, and society or maintenance charges."],
        ["9. Repairs: which repairs the landlord handles and which day-to-day upkeep the tenant handles."],
        ["10. Use and occupants: residential use, who will live there, and whether subletting is allowed."],
        ["11. Access: how much notice the landlord gives before visiting."],
        ["12. Ending the tenancy: notice period each side must give, and the handover condition."],
        ["13. Condition and inventory: attach a list of included items, existing damage and meter readings at handover."],
        ["14. Signatures: landlord and tenant, with two witnesses and their CNIC numbers, as is commonly done."],
      ],
    },
    {
      heading: "What the Punjab Rented Premises Act 2009 says",
      bullets: [
        ["A landlord must not let premises except by a written tenancy agreement (section 5(1))."],
        ["The landlord must present the agreement before the Rent Registrar, who records it, seals it, keeps a copy and returns the original to the landlord (section 5(2)–(3)). An agreement entered with the Rent Registrar, or its certified copy, is proof of the landlord–tenant relationship (section 5(5))."],
        ["Contents, as far as possible: particulars of both parties; description of the premises; period of tenancy; rent, rate of increase, due date and mode of payment; the landlord’s bank account if rent is paid through a bank; the purpose of the letting; and any advance rent, security or pagri (section 6(1))."],
        ["If the agreement does not give a due date, rent is due by the tenth day of the following month; if it does not give a mode, rent is paid by money order or deposit into the landlord’s bank account (section 7(2)–(3))."],
        ["The landlord must give the tenant a certified copy of the agreement."],
      ],
    },
    {
      heading: "Islamabad and other provinces",
      paragraphs: [
        [
          "In Islamabad, the Islamabad Rent Restriction (Amendment) Act 2021 requires the landlord to present the written tenancy agreement to the Controller within thirty days of signing. The Controller records it, seals it, keeps a copy and returns the original.",
        ],
        [
          "Sindh, Khyber Pakhtunkhwa and Balochistan have their own rented-premises laws. Do not assume the Punjab or Islamabad steps apply there; ask the local rent office or a lawyer.",
        ],
      ],
    },
    {
      heading: "Stamp paper and e-stamp",
      paragraphs: [
        [
          "Rent agreements are commonly written on stamp paper or e-stamp. In Punjab, e-stamp papers are issued through the Board of Revenue’s ",
          { href: "https://es.punjab-zameen.gov.pk/eStampCitizenPortal/ChallanFormView/HomePage", label: "e-Stamping Citizen Portal", external: true },
          ": you generate a Challan 32-A, pay at a designated bank or online, and print the stamp paper. The duty depends on the document and its terms, so let the portal or a deed writer work it out rather than copying an old figure.",
        ],
      ],
    },
    {
      heading: "After you sign",
      bullets: [
        [
          "Register the tenant with the police: within fifteen days in Punjab (see ",
          { href: "/guides/tenant-registration-punjab-police", label: "tenant registration with Punjab Police" },
          "), within forty-eight hours in Sindh.",
        ],
        ["Exchange receipts for the deposit, advance and every rent payment."],
        ["Keep the condition record and meter readings with your copy of the agreement."],
      ],
    },
    {
      heading: "Common mistakes",
      bullets: [
        ["Leaving the deposit return conditions unwritten."],
        ["Paying in cash with no receipt."],
        ["Copying a template with clauses that do not match the deal you made."],
        ["Assuming a clause can override a mandatory provision of the rent law — it cannot."],
      ],
    },
    {
      heading: "Find a tenant or a home",
      paragraphs: [
        [
          "Landlords can ",
          POST,
          ". Tenants can read ",
          { href: "/how-to-rent-a-house-in-pakistan", label: "how to rent a house in Pakistan" },
          " and ",
          { href: "/guides/landlords/security-deposit-rent-terms-pakistan", label: "security deposit and advance rent" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Is a written rent agreement compulsory in Punjab?",
      a: ["Yes. Section 5(1) of the Punjab Rented Premises Act 2009 says a landlord shall not let out premises except by a tenancy agreement, which the Act defines as a written agreement."],
    },
    {
      q: "Where is a rent agreement registered in Punjab?",
      a: ["The landlord presents it before the Rent Registrar, who records the particulars, seals the agreement, keeps a copy and returns the original (section 5 of the 2009 Act)."],
    },
    {
      q: "Do I need to register a rent agreement in Islamabad?",
      a: ["Yes. Under the Islamabad Rent Restriction (Amendment) Act 2021 the landlord presents the written agreement to the Controller within thirty days of signing."],
    },
    {
      q: "When is rent due if the agreement does not say?",
      a: ["In Punjab, by the tenth day of the following month (section 7(2) of the 2009 Act)."],
    },
    {
      q: "What should a rent agreement in Pakistan include?",
      a: ["At least the parties and CNICs, the premises, the term, rent with due date and payment mode, any increase, deposit or advance, bills, repairs, use, notice to end, and signatures with witnesses."],
    },
  ],
  sources: [SRC.prpa2009, SRC.irro2001, SRC.irro2021, SRC.eStampPortal, SRC.pitbEStamp, SRC.sindhAct],
  related: [
    { href: "/guides/tenant-registration-punjab-police", label: "Tenant registration with Punjab Police" },
    { href: "/guides/landlords/security-deposit-rent-terms-pakistan", label: "Security deposit and advance rent in Pakistan" },
    { href: "/guides/landlords/landlord-responsibilities-pakistan", label: "Landlord responsibilities in Pakistan" },
    { href: "/how-to-rent-a-house-in-pakistan", label: "How to rent a house in Pakistan" },
  ],
};

const propertyTax: QuestionGuide = {
  slug: "property-tax-on-buying-and-selling-property-pakistan",
  title: "Property Tax on Buying & Selling in Pakistan 2026-27 (236K, 236C) | Apna Ghar",
  h1: "Property tax when you buy or sell in Pakistan (2026-27)",
  description:
    "FBR advance tax for tax year 2027 from the official rate card: 236K on buyers (1.25% for filers) and 236C on sellers (2.75% for filers), plus stamp duty and annual property tax.",
  eyebrow: "BUYING • TAX",
  notice:
    "General information, not tax advice. Rates are copied from FBR’s official Withholding Income Tax Rate Card for tax year 2027 (1 July 2026 to 30 June 2027), updated to 30 June 2026 as per the Finance Act 2026. The law prevails over the card; confirm with FBR or a tax adviser before a transaction.",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    [
      "For tax year 2027, FBR’s rate card lists advance tax of 1.25% of fair market value on a buyer who is on the Active Taxpayers List (ATL) under section 236K, and 2.75% of the gross consideration on an ATL seller under section 236C. People not on the ATL pay much higher rates. Stamp duty, registration and annual property tax are separate, provincial charges.",
    ],
  ],
  sections: [
    {
      heading: "Buyer: section 236K advance tax (purchase of immovable property)",
      paragraphs: [["Charged on the fair market value. FBR rate card, tax year 2027:"]],
      bullets: [
        ["On the ATL (filer): 1.25%, at every value band."],
        ["Not on the ATL: 10.5% where the value does not exceed Rs 50 million."],
        ["Not on the ATL: 14.5% above Rs 50 million up to Rs 100 million."],
        ["Not on the ATL: 18.5% above Rs 100 million."],
      ],
    },
    {
      heading: "Seller: section 236C advance tax (transfer of immovable property)",
      paragraphs: [["Charged on the gross amount of consideration received. FBR rate card, tax year 2027:"]],
      bullets: [
        ["On the ATL (filer): 2.75%, at every value band."],
        ["Not on the ATL: 11.5%, at every value band."],
      ],
    },
    {
      heading: "Filer or non-filer",
      paragraphs: [
        [
          "“ATL” means FBR’s Active Taxpayers List. The gap between the two columns is large, so both buyer and seller should check their status on ",
          { href: "https://fbr.gov.pk/", label: "FBR’s website", external: true },
          " before agreeing a price.",
        ],
      ],
    },
    {
      heading: "Provincial charges: stamp duty, registration and transfer fees",
      paragraphs: [
        [
          "Stamp duty is a provincial charge, not an FBR tax. In Punjab it is paid through the e-Stamping system; PITB says the duty is calculated from the details you enter (land area, location, covered area, residential or commercial) using the DC valuation tables built into the system. Registration, mutation and housing society or authority transfer fees can apply on top. Use the ",
          { href: "https://es.punjab-zameen.gov.pk/eStampCitizenPortal/ChallanFormView/HomePage", label: "Punjab e-Stamping Citizen Portal", external: true },
          " (it also has a DC value calculator) instead of an old rate from a blog.",
        ],
      ],
    },
    {
      heading: "Annual property tax in Punjab",
      paragraphs: [
        [
          "Owning a property in an urban area of Punjab brings the annual Urban Immovable Property Tax, collected by the Excise, Taxation & Narcotics Control Department. Its ",
          { href: "https://excise.punjab.gov.pk/services", label: "services page", external: true },
          " offers a UIPT property tax calculator, online verification of PT-10 challans and e-Pay. Ask the seller for paid PT-10 challans before you buy.",
        ],
      ],
    },
    {
      heading: "Before you pay",
      paragraphs: [
        [
          "Taxes are only one part of a purchase. Check the documents first with ",
          { href: "/guides/buying/property-buying-due-diligence-pakistan", label: "how to verify property documents" },
          ", and follow ",
          { href: "/guides/buying/how-to-buy-property-in-pakistan", label: "the step-by-step buying process" },
          ". Selling? ",
          POST,
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "How much tax does a buyer pay on property in Pakistan in 2026-27?",
      a: ["Under section 236K, FBR’s tax year 2027 rate card lists 1.25% of fair market value for a buyer on the Active Taxpayers List, and 10.5%, 14.5% or 18.5% for a buyer not on it, depending on value. Provincial stamp duty and fees are extra."],
    },
    {
      q: "What is the 236C tax rate for sellers in 2026-27?",
      a: ["2.75% of the gross consideration for a seller on the Active Taxpayers List and 11.5% for a seller not on it, at every value band, per FBR’s tax year 2027 rate card."],
    },
    {
      q: "Is stamp duty paid to FBR?",
      a: ["No. Stamp duty is provincial. In Punjab it is paid through the Board of Revenue’s e-Stamping system, which calculates it using DC valuation tables."],
    },
    {
      q: "Where do I pay annual property tax in Punjab?",
      a: ["To the Excise, Taxation & Narcotics Control Department Punjab, which offers a UIPT calculator, PT-10 challan verification and e-Pay on its services page."],
    },
  ],
  sources: [SRC.fbrCardPage, SRC.fbrCard2027, SRC.pitbEStamp, SRC.eStampPortal, SRC.excise],
  related: [
    { href: "/guides/buying/how-to-buy-property-in-pakistan", label: "How to buy property in Pakistan" },
    { href: "/guides/buying/property-buying-due-diligence-pakistan", label: "How to verify property documents before buying" },
    { href: "/guides/buying/sale-agreement-registration-pakistan", label: "Sale agreement, token money and registration" },
    { href: "/guides/buying/fard-registry-intiqal-punjab", label: "Fard, registry and intiqal in Punjab" },
  ],
};

const rentOutYourHouse: QuestionGuide = {
  slug: "how-to-rent-out-your-house-in-pakistan",
  title: "How to Rent Out Your House in Pakistan: Find a Tenant | Apna Ghar",
  h1: "How to rent out your house in Pakistan and find a tenant",
  description:
    "Steps for owners renting out a house, portion or flat in Pakistan: set terms, post a free ad, check the tenant’s CNIC, sign and register the agreement, and register the tenant with police.",
  eyebrow: "LANDLORD GUIDE",
  notice: LAW_NOTICE,
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    [
      "To rent out a house, portion or flat: decide your terms, advertise with clear photos and the real rent, meet and check the tenant’s CNIC, sign a written agreement, register it where the law requires, and register the tenant with the police. The steps below follow that order, with the Punjab, Sindh and Islamabad rules that apply.",
    ],
  ],
  sections: [
    {
      heading: "1. Decide your terms",
      paragraphs: [
        [
          "Write down the monthly rent, any security deposit or advance, who pays which bills, which repairs you will handle, and whether families, bachelors or pets are fine. Read ",
          { href: "/guides/landlords/security-deposit-rent-terms-pakistan", label: "security deposit and advance rent" },
          " before you fix those amounts.",
        ],
      ],
    },
    {
      heading: "2. Set a realistic rent",
      paragraphs: [
        [
          "Compare homes of the same type, size and area that are actually advertised. Reported ranges for some cities are collected in ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-lahore", label: "Lahore" },
          ", ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-karachi", label: "Karachi" },
          " and ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-islamabad", label: "Islamabad" },
          ", with their sources. An over-priced ad usually just sits.",
        ],
      ],
    },
    {
      heading: "3. Advertise it",
      paragraphs: [
        [
          "You can ",
          POST,
          " — add the city and area, rent, bedrooms, a few clear photos and your phone number. You only sign in when you press Publish.",
        ],
      ],
    },
    {
      heading: "4. Meet the tenant and check identity",
      paragraphs: [
        [
          "In Punjab, section 5 of the Punjab Information of Temporary Residents Act 2015 says the landlord must not let a tenant stay without being satisfied of their identity from their CNIC or passport, must keep a copy, and must give it to the police. Sindh’s 2015 Act has the same rule. Meet in person and keep the copy with your records.",
        ],
      ],
    },
    {
      heading: "5. Sign and register the rent agreement",
      paragraphs: [
        [
          "Use the ",
          { href: "/guides/rent-agreement-format-pakistan", label: "rent agreement format" },
          ". In Punjab the Rented Premises Act 2009 requires a written tenancy agreement presented to the Rent Registrar, and you must give the tenant a certified copy. In Islamabad the agreement goes to the Controller within thirty days of signing.",
        ],
      ],
    },
    {
      heading: "6. Register the tenant with the police",
      bullets: [
        [
          "Punjab: within fifteen days of handing over possession — online or at a police station or Khidmat Markaz. See ",
          { href: "/guides/tenant-registration-punjab-police", label: "tenant registration with Punjab Police" },
          ".",
        ],
        ["Sindh, including Karachi: within forty-eight hours of possession; Karachi Police says it is free at the police station and also available online on the TRUST portal."],
        ["Islamabad: through the ICT Police tenant registration service."],
      ],
    },
    {
      heading: "7. Hand over properly",
      bullets: [
        ["Record meter readings and existing damage, with dated photos, and both sign the list."],
        ["Give receipts for the deposit, advance and every rent payment, or take rent by bank transfer."],
        ["Keep the agreement, CNIC copy and police registration together."],
      ],
    },
    {
      heading: "Your duties during the tenancy",
      paragraphs: [
        [
          "Repairs, utilities and access are covered in ",
          { href: "/guides/landlords/landlord-responsibilities-pakistan", label: "landlord responsibilities in Pakistan" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Can I post my house for rent for free?",
      a: ["Yes. Posting a property on Apna Ghar is free. You can fill in the ad without an account and sign in only when you publish."],
    },
    {
      q: "Do I have to register my tenant with the police?",
      a: ["In Punjab, yes, within fifteen days of possession under the Punjab Information of Temporary Residents Act 2015. In Sindh the Sindh Act gives forty-eight hours. Islamabad Police runs its own registration."],
    },
    {
      q: "Do I have to register the rent agreement?",
      a: ["In Punjab the landlord presents the written agreement before the Rent Registrar (Punjab Rented Premises Act 2009, section 5). In Islamabad it goes to the Controller within thirty days (2021 amendment)."],
    },
    {
      q: "What should I take from the tenant?",
      a: ["A copy of their CNIC or passport, which the 2015 Act requires you to keep and give to the police. For in-person police registration in Punjab, photographs of owner and tenant and the rent agreement are also listed."],
    },
  ],
  sources: [SRC.pitra2015, SRC.sindhAct, SRC.prpa2009, SRC.irro2021, SRC.punjabTrs, SRC.karachiPolice, SRC.ictPolice],
  related: [
    { href: "/post", label: "Post your property free" },
    { href: "/guides/rent-agreement-format-pakistan", label: "Rent agreement format in Pakistan" },
    { href: "/guides/tenant-registration-punjab-police", label: "Tenant registration with Punjab Police" },
    { href: "/guides/landlords/landlord-responsibilities-pakistan", label: "Landlord responsibilities in Pakistan" },
  ],
};

export const HOWTO_GUIDES: QuestionGuide[] = [tenantRegistrationPunjab, rentAgreementFormat, rentOutYourHouse, propertyTax];
