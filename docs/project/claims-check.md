# Claims check (finding 4)

Checked 28 Oct 2026 against official sources. Applies to `public/index.html` on the `claude-style-pricing` branch.

| # | Claim on the site | Verdict | Change |
|---|---|---|---|
| C1 | Cyber Essentials is "a cybersecurity mark from CSA, made for smaller businesses" | Mostly right. CSA says its simplified requirements help organisations, "especially SMEs". | "made for smaller businesses" -> "designed with smaller businesses in mind" |
| C2 | "a CSA-appointed certification body does the assessment" | Correct. Certification is done by certification bodies appointed by CSA; it's a desktop review of your self-assessment; valid for 2 years. | None |
| C3 | "CSA funding may cover part of the fee for your first certification" | Partly wrong. CSA funds successfully certified organisations by deducting from the certification body's fee, up to S$250 (1 to 10 endpoints), S$350 (11 to 20), S$450 (21 to 50). CSA's page doesn't limit this to a first certification. | Replace with: "CSA currently funds part of the certification body's fee: up to S$250 for 1 to 10 devices, S$350 for 11 to 20." |
| C4 | "Customers pay by card or PayNow, and Stripe pays out to your bank account" | Correct for a Singapore Stripe account in SGD. PayNow can't be charged automatically (one-off payments and sent invoices only), and statements show "STRIPE PAYMENTS SINGAPORE PTE. LTD." | None on the site. Note in the delivery checklist. |
| C5 | "Laptops managed, encrypted and remotely wipeable" (Secure Team) | Needs the right licence. Microsoft: device management (Intune) is only in Microsoft 365 Business Premium, not Basic or Standard. Google: Windows 10/11 laptops can be wiped on Business Starter, Standard and Plus once enrolled in Windows device management; Google's page doesn't cover Macs. | Add under Secure Team: "Needs Microsoft 365 Business Premium, or Google Workspace with Windows device management. Macs on request." |
| C6 | "Gemini or Copilot set up with your data protected" | Right, but vague. Google: Workspace data isn't used to train its models, isn't reviewed by humans, and Gemini only reaches files the user can already open. Microsoft: Copilot Chat has enterprise data protection at no extra cost; prompts and responses aren't used to train foundation models. | "Gemini or Copilot set up so your business data isn't used to train AI and stays within your existing file permissions" |
| C7 | "WhatsApp Business on a company number your team shares" | Plausible, not confirmed from WhatsApp's own help pages. Reports say the free app links up to 4 extra devices. | Keep. Delivery checklist limits it to the phone plus 4 linked devices. |

Also update the JSON-LD `Secure Team` offer description if C5 or C6 wording changes there.

## Business note (not a site claim)

CSA co-funds up to 70% of consultancy from CSA-onboarded "CISO as-a-Service" providers to prepare SMEs for Cyber Essentials (applied for through IMDA's SMEs Go Digital). Infrazz isn't an onboarded provider, so a client can't use that funding with Infrazz. Cyber Essentials Ready at S$990 competes with a subsidised alternative. Open question on the hub: Q5.

## Sources

- CSA, Certification for the Cyber Essentials mark: https://www.csa.gov.sg/cyber-essentials/certification-for-the-cyber-essentials-mark
- CSA, CISO as-a-Service: https://www.csa.gov.sg/our-programmes/support-for-enterprises/sg-cyber-safe-programme/cybersecurity-certification-for-organisations/ciso-as-a-service-to-develop-cybersecurity-health-plan/
- CSA press release, 15 Apr 2025: https://www.csa.gov.sg/news-events/press-releases/csa-s-cyber-essentials-and-cyber-trust-marks-expanded-to-include-cloud-security--artificial-intelligence-and-operational-technology/
- Stripe, PayNow payments: https://docs.stripe.com/payments/paynow
- Microsoft, compare Microsoft 365 business plans: https://www.microsoft.com/en-us/microsoft-365/business/compare-all-microsoft-365-business-products
- Google, Wipe corporate data from a device: https://knowledge.workspace.google.com/admin/devices/wipe-corporate-data-from-a-device
- Google Workspace, Generative AI privacy: https://workspace.google.com/intl/en-US/security/ai-privacy/
- Microsoft, Enterprise data protection in Copilot: https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection
- Microsoft, Copilot privacy and protections: https://learn.microsoft.com/en-us/copilot/privacy-and-protections
- XDA Developers, WhatsApp Business linked devices: https://www.xda-developers.com/whatsapp-business-could-charge-users/
