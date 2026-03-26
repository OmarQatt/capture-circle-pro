

## Business Requirements Document (BRD) — Production & Filming Services Marketplace

### Output
A professional Word document (.docx) in English with an Arabic summary section, including system diagrams and ER diagrams.

### Document Structure

**1. Executive Summary** (English + Arabic ملخص تنفيذي)
- Platform overview: A marketplace connecting production companies/freelancers with filming locations, equipment, models/talent, and crew
- Revenue model: Commission per booking

**2. Stakeholder & User Roles**
- **Admin**: Reviews/approves locations, manages platform, handles disputes
- **Employee (Field Agent)**: Accompanies clients to location visits, prevents fraud
- **Location Owner**: Submits filming locations for listing
- **Equipment Provider (Company)**: Lists equipment inventory with availability
- **Model/Talent**: Creates casting profile with detailed attributes
- **Crew (DP, AC, Photographer)**: Creates professional profile with roles & availability
- **Client (Renter)**: Browses, filters, books, and reviews services

**3. Core Feature Modules**

- **Locations Module**: Location submission → admin review → listing with map (employee-only view), photos, pricing, availability calendar, external date blocking, reviews
- **Equipment Module**: Company accounts listing equipment with photos, descriptions, rental pricing, availability status, day/time booking, condition tracking with photo evidence on return
- **Models/Casting Module**: Detailed profiles (experience, gender, age, skin tone, height, weight, location), advanced filtering, availability calendar
- **Crew Module**: Professional profiles with role types (DP, 1st AC, 2nd AC, 3rd AC, etc.), portfolio, filtering, availability calendar
- **Booking & Scheduling**: Calendar-based availability, external date blocking (for bookings made outside platform — no commission), time slot selection
- **Reviews & Comments**: Reviews and ratings for locations, models, crew, and equipment
- **Employee Visit System**: Client requests location visit → employee assigned → accompanies client to prevent direct deals

**4. Policies & Rules**
- No-show policy for all service providers (models, crew, etc.) — penalties when a paid booking is missed
- Equipment damage policy with photo evidence documentation
- External booking policy — providers can block dates for outside rentals (platform doesn't take commission)
- Equipment contract terms between platform and equipment companies

**5. System Architecture Diagram**
- Mermaid-based system overview showing all modules and their interactions

**6. Entity Relationship Diagram**
- Users, Roles, Locations, Equipment, Models, Crew, Bookings, Reviews, Availability, Equipment Condition Logs

**7. User Flow Diagrams**
- Location booking flow (with employee visit)
- Equipment rental flow (with condition tracking)
- Model/crew hiring flow
- Admin review/approval flow

**8. Non-Functional Requirements**
- Responsive web design, multi-language support, secure payments, role-based access

**9. Arabic Summary (ملخص باللغة العربية)**
- Full summary of the platform, features, and policies in Arabic

