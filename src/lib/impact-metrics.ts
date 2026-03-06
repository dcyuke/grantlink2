/**
 * Impact Measurement Metric Frameworks
 *
 * Each issue area has 8–12 metrics categorised as:
 *   - output:  direct, countable results of activities
 *   - outcome: measurable changes in knowledge, behaviour, or condition
 *   - impact:  longer-term systemic or community-level change
 */

export type MetricCategory = 'output' | 'outcome' | 'impact'

export interface MetricDefinition {
  id: string
  label: string
  category: MetricCategory
  unit: string            // e.g. "people", "dollars", "%", "events"
  description: string     // guidance shown to user during setup
  exampleTarget?: string  // e.g. "500 students per year"
}

export interface IssueAreaFramework {
  slug: string
  name: string
  metrics: MetricDefinition[]
}

// ── Education & Learning ───────────────────────────────────────────
const education: IssueAreaFramework = {
  slug: 'education',
  name: 'Education & Learning',
  metrics: [
    { id: 'edu-students-served', label: 'Students served', category: 'output', unit: 'people', description: 'Total number of students who participated in programs', exampleTarget: '200 students per year' },
    { id: 'edu-sessions-delivered', label: 'Sessions or classes delivered', category: 'output', unit: 'sessions', description: 'Number of teaching sessions, workshops, or classes held', exampleTarget: '48 sessions per year' },
    { id: 'edu-hours-instruction', label: 'Hours of instruction', category: 'output', unit: 'hours', description: 'Total instructional hours delivered across all programs', exampleTarget: '500 hours per year' },
    { id: 'edu-materials-distributed', label: 'Learning materials distributed', category: 'output', unit: 'items', description: 'Books, supplies, or digital resources provided', exampleTarget: '300 items per year' },
    { id: 'edu-completion-rate', label: 'Program completion rate', category: 'outcome', unit: '%', description: 'Percentage of enrolled students who completed the program', exampleTarget: '75–85%' },
    { id: 'edu-skill-gain', label: 'Students showing skill improvement', category: 'outcome', unit: 'people', description: 'Students who demonstrated measurable skill gains via assessment', exampleTarget: '120 students per year' },
    { id: 'edu-grade-improvement', label: 'Students with grade improvement', category: 'outcome', unit: 'people', description: 'Students whose grades improved after participation', exampleTarget: '80 students per year' },
    { id: 'edu-graduation-rate', label: 'Graduation or advancement rate', category: 'outcome', unit: '%', description: 'Percentage of participants who graduated or advanced to the next level', exampleTarget: '70–80%' },
    { id: 'edu-college-enrollment', label: 'Post-secondary enrollment', category: 'impact', unit: 'people', description: 'Participants who enrolled in college or further education', exampleTarget: '30 students per year' },
    { id: 'edu-career-placement', label: 'Career or job placement', category: 'impact', unit: 'people', description: 'Participants who secured employment related to their studies', exampleTarget: '25 placements per year' },
  ],
}

// ── Health & Wellness ──────────────────────────────────────────────
const health: IssueAreaFramework = {
  slug: 'health',
  name: 'Health & Wellness',
  metrics: [
    { id: 'hlt-patients-served', label: 'Patients or clients served', category: 'output', unit: 'people', description: 'Total individuals who received health services', exampleTarget: '500 clients per year' },
    { id: 'hlt-screenings', label: 'Health screenings conducted', category: 'output', unit: 'screenings', description: 'Number of preventive screenings or assessments performed', exampleTarget: '200 screenings per year' },
    { id: 'hlt-visits', label: 'Service visits or appointments', category: 'output', unit: 'visits', description: 'Total clinical or service visits delivered', exampleTarget: '1,000 visits per year' },
    { id: 'hlt-referrals', label: 'Referrals to care', category: 'output', unit: 'referrals', description: 'Number of referrals made to specialists or follow-up care', exampleTarget: '100 referrals per year' },
    { id: 'hlt-health-improvement', label: 'Clients showing health improvement', category: 'outcome', unit: 'people', description: 'Clients who showed measurable improvement in health indicators', exampleTarget: '150 clients per year' },
    { id: 'hlt-behavior-change', label: 'Clients adopting healthier behaviors', category: 'outcome', unit: 'people', description: 'Clients who reported or demonstrated healthier lifestyle changes', exampleTarget: '100 clients per year' },
    { id: 'hlt-insurance-enrollment', label: 'Insurance enrollment assisted', category: 'outcome', unit: 'people', description: 'Individuals helped to enroll in health insurance', exampleTarget: '75 enrollments per year' },
    { id: 'hlt-er-reduction', label: 'Reduction in ER visits', category: 'impact', unit: '%', description: 'Decrease in emergency room visits among participants', exampleTarget: '15–25% reduction' },
    { id: 'hlt-chronic-management', label: 'Chronic condition management', category: 'impact', unit: 'people', description: 'Patients successfully managing chronic conditions', exampleTarget: '50 patients per year' },
    { id: 'hlt-community-health', label: 'Community health indicators improved', category: 'impact', unit: 'indicators', description: 'Population-level health measures that have improved', exampleTarget: '2–3 indicators per year' },
  ],
}

// ── Environment & Climate ──────────────────────────────────────────
const environment: IssueAreaFramework = {
  slug: 'environment',
  name: 'Environment & Climate',
  metrics: [
    { id: 'env-acres-conserved', label: 'Acres or hectares conserved', category: 'output', unit: 'acres', description: 'Land area protected, restored, or conserved', exampleTarget: '50 acres per year' },
    { id: 'env-trees-planted', label: 'Trees planted', category: 'output', unit: 'trees', description: 'Number of trees planted or restored', exampleTarget: '500 trees per year' },
    { id: 'env-volunteers', label: 'Volunteers engaged', category: 'output', unit: 'people', description: 'Number of volunteers participating in environmental activities', exampleTarget: '150 volunteers per year' },
    { id: 'env-events', label: 'Events or cleanups held', category: 'output', unit: 'events', description: 'Community cleanups, workshops, or advocacy events', exampleTarget: '12 events per year' },
    { id: 'env-waste-diverted', label: 'Waste diverted from landfill', category: 'outcome', unit: 'tons', description: 'Tons of waste recycled, composted, or reused', exampleTarget: '20 tons per year' },
    { id: 'env-emissions-reduced', label: 'Carbon emissions reduced', category: 'outcome', unit: 'metric tons CO₂', description: 'Estimated reduction in greenhouse gas emissions', exampleTarget: '50 metric tons CO₂ per year' },
    { id: 'env-water-quality', label: 'Water quality improvement', category: 'outcome', unit: 'sites', description: 'Number of water bodies or sites showing improved quality', exampleTarget: '2–3 sites per year' },
    { id: 'env-species-protected', label: 'Species or habitats protected', category: 'outcome', unit: 'species', description: 'Number of at-risk species or habitats with improved protections', exampleTarget: '3–5 species per year' },
    { id: 'env-policy-influence', label: 'Policies influenced', category: 'impact', unit: 'policies', description: 'Environmental policies adopted or strengthened', exampleTarget: '1–2 policies per year' },
    { id: 'env-community-resilience', label: 'Communities with improved resilience', category: 'impact', unit: 'communities', description: 'Communities better prepared for environmental challenges', exampleTarget: '2–3 communities per year' },
  ],
}

// ── Arts & Culture ─────────────────────────────────────────────────
const artsCulture: IssueAreaFramework = {
  slug: 'arts-culture',
  name: 'Arts & Culture',
  metrics: [
    { id: 'art-attendees', label: 'Event attendees', category: 'output', unit: 'people', description: 'Total attendance across performances, exhibitions, or events', exampleTarget: '1,000 attendees per year' },
    { id: 'art-programs-offered', label: 'Programs or exhibitions offered', category: 'output', unit: 'programs', description: 'Number of artistic programs, shows, or exhibitions', exampleTarget: '8–12 programs per year' },
    { id: 'art-artists-supported', label: 'Artists supported', category: 'output', unit: 'artists', description: 'Number of artists who received support, grants, or platforms', exampleTarget: '20 artists per year' },
    { id: 'art-workshops', label: 'Workshops or classes held', category: 'output', unit: 'workshops', description: 'Art education sessions, masterclasses, or workshops', exampleTarget: '24 workshops per year' },
    { id: 'art-participant-growth', label: 'Creative skill development', category: 'outcome', unit: 'people', description: 'Participants who demonstrated artistic or creative skill growth', exampleTarget: '50 participants per year' },
    { id: 'art-community-engagement', label: 'Community engagement increase', category: 'outcome', unit: '%', description: 'Growth in community participation in arts programming', exampleTarget: '10–20% annual growth' },
    { id: 'art-revenue-generated', label: 'Revenue generated for artists', category: 'outcome', unit: 'dollars', description: 'Income generated for participating artists through programming', exampleTarget: '$15,000 per year' },
    { id: 'art-cultural-preservation', label: 'Cultural traditions preserved', category: 'impact', unit: 'traditions', description: 'Cultural practices, languages, or traditions documented or sustained', exampleTarget: '2–4 traditions per year' },
    { id: 'art-access-equity', label: 'Access equity improved', category: 'impact', unit: 'communities', description: 'Underserved communities gaining access to arts programming', exampleTarget: '3 communities per year' },
  ],
}

// ── Economic Development ───────────────────────────────────────────
const economicDevelopment: IssueAreaFramework = {
  slug: 'economic-development',
  name: 'Economic Development',
  metrics: [
    { id: 'econ-businesses-assisted', label: 'Businesses assisted', category: 'output', unit: 'businesses', description: 'Number of businesses receiving technical assistance or support', exampleTarget: '30 businesses per year' },
    { id: 'econ-loans-grants', label: 'Loans or micro-grants issued', category: 'output', unit: 'awards', description: 'Number of financial awards distributed to entrepreneurs', exampleTarget: '15 awards per year' },
    { id: 'econ-training-hours', label: 'Training hours delivered', category: 'output', unit: 'hours', description: 'Hours of business training, financial literacy, or coaching', exampleTarget: '300 hours per year' },
    { id: 'econ-participants', label: 'Program participants', category: 'output', unit: 'people', description: 'Individuals who participated in economic programs', exampleTarget: '100 participants per year' },
    { id: 'econ-jobs-created', label: 'Jobs created', category: 'outcome', unit: 'jobs', description: 'New jobs created by supported businesses', exampleTarget: '20 jobs per year' },
    { id: 'econ-revenue-growth', label: 'Business revenue growth', category: 'outcome', unit: 'dollars', description: 'Aggregate revenue increase among assisted businesses', exampleTarget: '$200,000 total per year' },
    { id: 'econ-business-survival', label: 'Business survival rate', category: 'outcome', unit: '%', description: 'Percentage of supported businesses still operating after 1+ years', exampleTarget: '75–85%' },
    { id: 'econ-income-increase', label: 'Participant income increase', category: 'outcome', unit: 'dollars', description: 'Average income increase among program participants', exampleTarget: '$3,000 average increase' },
    { id: 'econ-wealth-gap', label: 'Wealth gap reduction', category: 'impact', unit: '%', description: 'Measurable reduction in economic disparities in target area', exampleTarget: '5–10% improvement' },
    { id: 'econ-community-investment', label: 'Community investment attracted', category: 'impact', unit: 'dollars', description: 'Additional investment dollars attracted to the community', exampleTarget: '$100,000 per year' },
  ],
}

// ── Social Justice & Equity ────────────────────────────────────────
const socialJustice: IssueAreaFramework = {
  slug: 'social-justice',
  name: 'Social Justice & Equity',
  metrics: [
    { id: 'sj-individuals-served', label: 'Individuals served', category: 'output', unit: 'people', description: 'People who received direct services or support', exampleTarget: '300 people per year' },
    { id: 'sj-legal-cases', label: 'Legal cases or consultations', category: 'output', unit: 'cases', description: 'Legal representation, know-your-rights consultations, or cases', exampleTarget: '50 cases per year' },
    { id: 'sj-trainings', label: 'Trainings or workshops held', category: 'output', unit: 'trainings', description: 'Educational sessions on equity, rights, or advocacy', exampleTarget: '12 trainings per year' },
    { id: 'sj-campaigns', label: 'Advocacy campaigns launched', category: 'output', unit: 'campaigns', description: 'Public awareness or advocacy campaigns', exampleTarget: '3–4 campaigns per year' },
    { id: 'sj-legal-outcomes', label: 'Favorable legal outcomes', category: 'outcome', unit: 'cases', description: 'Cases resulting in positive resolution for clients', exampleTarget: '30 favorable outcomes per year' },
    { id: 'sj-awareness-increase', label: 'Awareness or knowledge increase', category: 'outcome', unit: '%', description: 'Measured increase in rights awareness among participants', exampleTarget: '25–40% increase' },
    { id: 'sj-voter-registration', label: 'Voter registrations', category: 'outcome', unit: 'registrations', description: 'New voter registrations facilitated', exampleTarget: '200 registrations per year' },
    { id: 'sj-policy-changes', label: 'Policy changes achieved', category: 'impact', unit: 'policies', description: 'Laws, policies, or practices changed through advocacy', exampleTarget: '1–2 policies per year' },
    { id: 'sj-systemic-change', label: 'Systemic barriers reduced', category: 'impact', unit: 'barriers', description: 'Institutional barriers identified and addressed', exampleTarget: '2–3 barriers addressed per year' },
  ],
}

// ── Youth Development ──────────────────────────────────────────────
const youthDevelopment: IssueAreaFramework = {
  slug: 'youth-development',
  name: 'Youth Development',
  metrics: [
    { id: 'yth-youth-served', label: 'Youth served', category: 'output', unit: 'people', description: 'Number of young people participating in programs', exampleTarget: '150 youth per year' },
    { id: 'yth-mentoring-hours', label: 'Mentoring hours', category: 'output', unit: 'hours', description: 'Total hours of mentoring provided', exampleTarget: '400 hours per year' },
    { id: 'yth-activities-offered', label: 'Activities or programs offered', category: 'output', unit: 'programs', description: 'Number of distinct youth programs or activities', exampleTarget: '6–10 programs per year' },
    { id: 'yth-families-engaged', label: 'Families engaged', category: 'output', unit: 'families', description: 'Families who participated in family engagement activities', exampleTarget: '75 families per year' },
    { id: 'yth-leadership-skills', label: 'Youth showing leadership growth', category: 'outcome', unit: 'people', description: 'Young people demonstrating improved leadership abilities', exampleTarget: '40 youth per year' },
    { id: 'yth-academic-improvement', label: 'Academic improvement', category: 'outcome', unit: 'people', description: 'Youth who showed measurable academic progress', exampleTarget: '60 youth per year' },
    { id: 'yth-retention', label: 'Program retention rate', category: 'outcome', unit: '%', description: 'Percentage of youth who stayed engaged throughout the program', exampleTarget: '70–80%' },
    { id: 'yth-behavioral-improvement', label: 'Behavioral improvement', category: 'outcome', unit: 'people', description: 'Youth with reduced behavioral incidents or improved social skills', exampleTarget: '30 youth per year' },
    { id: 'yth-college-career', label: 'College or career readiness', category: 'impact', unit: 'people', description: 'Youth who achieved college or career readiness milestones', exampleTarget: '25 youth per year' },
    { id: 'yth-community-contribution', label: 'Community service hours by youth', category: 'impact', unit: 'hours', description: 'Volunteer hours contributed by program participants', exampleTarget: '500 hours per year' },
  ],
}

// ── Housing & Homelessness ─────────────────────────────────────────
const housing: IssueAreaFramework = {
  slug: 'housing',
  name: 'Housing & Homelessness',
  metrics: [
    { id: 'hsg-individuals-housed', label: 'Individuals housed', category: 'output', unit: 'people', description: 'People placed into permanent or transitional housing', exampleTarget: '50 people per year' },
    { id: 'hsg-shelter-nights', label: 'Shelter nights provided', category: 'output', unit: 'nights', description: 'Total emergency shelter bed-nights', exampleTarget: '5,000 nights per year' },
    { id: 'hsg-units-built', label: 'Housing units built or rehabilitated', category: 'output', unit: 'units', description: 'Affordable housing units constructed or renovated', exampleTarget: '10 units per year' },
    { id: 'hsg-case-management', label: 'Case management sessions', category: 'output', unit: 'sessions', description: 'Individual case management meetings held', exampleTarget: '400 sessions per year' },
    { id: 'hsg-housing-retention', label: 'Housing retention rate (6 months)', category: 'outcome', unit: '%', description: 'Percentage of placed individuals still housed after 6 months', exampleTarget: '80–90%' },
    { id: 'hsg-income-stability', label: 'Income stability achieved', category: 'outcome', unit: 'people', description: 'Clients who achieved stable income or employment', exampleTarget: '25 clients per year' },
    { id: 'hsg-eviction-prevention', label: 'Evictions prevented', category: 'outcome', unit: 'households', description: 'Households that avoided eviction through intervention', exampleTarget: '40 households per year' },
    { id: 'hsg-self-sufficiency', label: 'Clients achieving self-sufficiency', category: 'outcome', unit: 'people', description: 'Individuals transitioning off support services', exampleTarget: '15 clients per year' },
    { id: 'hsg-homelessness-reduction', label: 'Reduction in local homelessness', category: 'impact', unit: '%', description: 'Measured decrease in homelessness in service area', exampleTarget: '5–10% reduction' },
    { id: 'hsg-affordable-stock', label: 'Affordable housing stock increase', category: 'impact', unit: 'units', description: 'Net increase in affordable units in community', exampleTarget: '10 units per year' },
  ],
}

// ── Food & Agriculture ─────────────────────────────────────────────
const foodAgriculture: IssueAreaFramework = {
  slug: 'food-agriculture',
  name: 'Food & Agriculture',
  metrics: [
    { id: 'food-meals-provided', label: 'Meals or food boxes provided', category: 'output', unit: 'meals', description: 'Total meals served or food boxes distributed', exampleTarget: '10,000 meals per year' },
    { id: 'food-people-served', label: 'People served', category: 'output', unit: 'people', description: 'Individuals who received food assistance', exampleTarget: '500 people per year' },
    { id: 'food-pounds-distributed', label: 'Pounds of food distributed', category: 'output', unit: 'pounds', description: 'Total weight of food distributed', exampleTarget: '50,000 pounds per year' },
    { id: 'food-garden-sites', label: 'Garden or farm sites operated', category: 'output', unit: 'sites', description: 'Community gardens, farms, or food production sites', exampleTarget: '3–5 sites' },
    { id: 'food-insecurity-reduction', label: 'Food insecurity reduction', category: 'outcome', unit: 'people', description: 'People who reported reduced food insecurity', exampleTarget: '150 people per year' },
    { id: 'food-nutrition-knowledge', label: 'Nutrition knowledge improved', category: 'outcome', unit: 'people', description: 'Participants with improved understanding of healthy eating', exampleTarget: '100 participants per year' },
    { id: 'food-local-sourcing', label: 'Local food sourcing increase', category: 'outcome', unit: '%', description: 'Increase in locally sourced food in distribution', exampleTarget: '10–15% increase' },
    { id: 'food-waste-reduced', label: 'Food waste reduced', category: 'outcome', unit: 'pounds', description: 'Pounds of food rescued from waste', exampleTarget: '10,000 pounds per year' },
    { id: 'food-food-access', label: 'Communities with improved food access', category: 'impact', unit: 'communities', description: 'Food deserts or low-access areas with improved options', exampleTarget: '2 communities per year' },
    { id: 'food-system-change', label: 'Food system policy changes', category: 'impact', unit: 'policies', description: 'Policies advancing food justice or local food systems', exampleTarget: '1–2 policies per year' },
  ],
}

// ── Technology & Innovation ────────────────────────────────────────
const technology: IssueAreaFramework = {
  slug: 'technology',
  name: 'Technology & Innovation',
  metrics: [
    { id: 'tech-people-trained', label: 'People trained', category: 'output', unit: 'people', description: 'Individuals who completed technology training', exampleTarget: '100 people per year' },
    { id: 'tech-devices-distributed', label: 'Devices distributed', category: 'output', unit: 'devices', description: 'Computers, tablets, or devices provided', exampleTarget: '50 devices per year' },
    { id: 'tech-programs-offered', label: 'Programs or courses offered', category: 'output', unit: 'programs', description: 'Technology education courses or workshops', exampleTarget: '6–8 courses per year' },
    { id: 'tech-connectivity', label: 'Broadband connections enabled', category: 'output', unit: 'connections', description: 'Households or individuals connected to internet', exampleTarget: '30 connections per year' },
    { id: 'tech-literacy-improvement', label: 'Digital literacy improvement', category: 'outcome', unit: 'people', description: 'Participants with measurable gains in digital skills', exampleTarget: '60 people per year' },
    { id: 'tech-certification', label: 'Certifications earned', category: 'outcome', unit: 'certifications', description: 'Industry-recognized certifications achieved', exampleTarget: '25 certifications per year' },
    { id: 'tech-employment', label: 'Tech employment secured', category: 'outcome', unit: 'people', description: 'Participants who secured technology-related employment', exampleTarget: '15 placements per year' },
    { id: 'tech-digital-divide', label: 'Digital divide reduction', category: 'impact', unit: 'communities', description: 'Communities with measurably reduced digital disparities', exampleTarget: '2 communities per year' },
    { id: 'tech-innovation-launched', label: 'Solutions or tools launched', category: 'impact', unit: 'solutions', description: 'Technology solutions deployed to address community needs', exampleTarget: '1–2 solutions per year' },
  ],
}

// ── Civic Engagement ───────────────────────────────────────────────
const civicEngagement: IssueAreaFramework = {
  slug: 'civic-engagement',
  name: 'Civic Engagement',
  metrics: [
    { id: 'civ-people-engaged', label: 'People engaged', category: 'output', unit: 'people', description: 'Individuals who participated in civic activities', exampleTarget: '300 people per year' },
    { id: 'civ-events-held', label: 'Events or forums held', category: 'output', unit: 'events', description: 'Town halls, forums, or civic education events', exampleTarget: '10 events per year' },
    { id: 'civ-voter-contacts', label: 'Voter contacts made', category: 'output', unit: 'contacts', description: 'Outreach touches via door-knocking, calls, or texts', exampleTarget: '2,000 contacts per year' },
    { id: 'civ-registrations', label: 'Voter registrations', category: 'output', unit: 'registrations', description: 'New voter registrations facilitated', exampleTarget: '200 registrations per year' },
    { id: 'civ-turnout-increase', label: 'Voter turnout increase', category: 'outcome', unit: '%', description: 'Increase in voter participation in target areas', exampleTarget: '5–10% increase' },
    { id: 'civ-civic-knowledge', label: 'Civic knowledge improvement', category: 'outcome', unit: 'people', description: 'Participants with increased understanding of civic processes', exampleTarget: '100 people per year' },
    { id: 'civ-community-leaders', label: 'Community leaders developed', category: 'outcome', unit: 'people', description: 'New community leaders emerging from programs', exampleTarget: '10–15 leaders per year' },
    { id: 'civ-policy-input', label: 'Community input in policy processes', category: 'impact', unit: 'processes', description: 'Policy decisions with meaningful community participation', exampleTarget: '3–5 processes per year' },
    { id: 'civ-representation', label: 'Increased representation', category: 'impact', unit: 'positions', description: 'Underrepresented groups gaining elected or appointed positions', exampleTarget: '2–3 positions per year' },
  ],
}

// ── International Development ──────────────────────────────────────
const international: IssueAreaFramework = {
  slug: 'international',
  name: 'International Development',
  metrics: [
    { id: 'intl-beneficiaries', label: 'Beneficiaries reached', category: 'output', unit: 'people', description: 'Individuals directly benefiting from programs', exampleTarget: '1,000 beneficiaries per year' },
    { id: 'intl-communities-served', label: 'Communities served', category: 'output', unit: 'communities', description: 'Number of communities receiving support', exampleTarget: '5–10 communities per year' },
    { id: 'intl-projects-completed', label: 'Projects completed', category: 'output', unit: 'projects', description: 'Infrastructure, education, or health projects finished', exampleTarget: '3–5 projects per year' },
    { id: 'intl-local-partners', label: 'Local partners engaged', category: 'output', unit: 'partners', description: 'Local organizations partnered with for implementation', exampleTarget: '4–6 partners' },
    { id: 'intl-capacity-built', label: 'Local capacity strengthened', category: 'outcome', unit: 'organizations', description: 'Local organizations with increased operational capacity', exampleTarget: '3 organizations per year' },
    { id: 'intl-health-outcomes', label: 'Health outcomes improved', category: 'outcome', unit: 'people', description: 'People with measurably improved health indicators', exampleTarget: '200 people per year' },
    { id: 'intl-education-access', label: 'Education access expanded', category: 'outcome', unit: 'people', description: 'Children or adults gaining access to education', exampleTarget: '300 people per year' },
    { id: 'intl-economic-improvement', label: 'Economic improvement', category: 'outcome', unit: 'households', description: 'Households with measurable economic gains', exampleTarget: '50 households per year' },
    { id: 'intl-sustainability', label: 'Program sustainability achieved', category: 'impact', unit: 'programs', description: 'Programs successfully transitioned to local ownership', exampleTarget: '1–2 programs per year' },
    { id: 'intl-sdg-contribution', label: 'SDG indicators advanced', category: 'impact', unit: 'indicators', description: 'UN Sustainable Development Goal indicators improved', exampleTarget: '2–3 indicators per year' },
  ],
}

// ── Disability Rights ──────────────────────────────────────────────
const disability: IssueAreaFramework = {
  slug: 'disability',
  name: 'Disability Rights',
  metrics: [
    { id: 'dis-individuals-served', label: 'Individuals served', category: 'output', unit: 'people', description: 'People with disabilities receiving services or support', exampleTarget: '100 individuals per year' },
    { id: 'dis-accommodations', label: 'Accommodations facilitated', category: 'output', unit: 'accommodations', description: 'Workplace, educational, or public accommodations secured', exampleTarget: '30 accommodations per year' },
    { id: 'dis-trainings', label: 'Accessibility trainings delivered', category: 'output', unit: 'trainings', description: 'Trainings on disability rights, accessibility, or inclusion', exampleTarget: '8 trainings per year' },
    { id: 'dis-advocacy-actions', label: 'Advocacy actions taken', category: 'output', unit: 'actions', description: 'Letters, meetings, or campaigns for disability rights', exampleTarget: '20 actions per year' },
    { id: 'dis-employment', label: 'Employment secured', category: 'outcome', unit: 'people', description: 'Individuals with disabilities who secured employment', exampleTarget: '15 placements per year' },
    { id: 'dis-independence', label: 'Independent living achieved', category: 'outcome', unit: 'people', description: 'People transitioned to independent living arrangements', exampleTarget: '10 people per year' },
    { id: 'dis-accessibility-improvements', label: 'Accessibility improvements made', category: 'outcome', unit: 'improvements', description: 'Physical or digital accessibility barriers removed', exampleTarget: '15 improvements per year' },
    { id: 'dis-inclusion-policies', label: 'Inclusion policies adopted', category: 'impact', unit: 'policies', description: 'Organizations adopting disability inclusion policies', exampleTarget: '3–5 policies per year' },
    { id: 'dis-rights-awareness', label: 'Rights awareness increased', category: 'impact', unit: 'people', description: 'People with improved knowledge of disability rights', exampleTarget: '200 people per year' },
  ],
}

// ── Mental Health ──────────────────────────────────────────────────
const mentalHealth: IssueAreaFramework = {
  slug: 'mental-health',
  name: 'Mental Health',
  metrics: [
    { id: 'mh-clients-served', label: 'Clients served', category: 'output', unit: 'people', description: 'Individuals receiving mental health services', exampleTarget: '150 clients per year' },
    { id: 'mh-counseling-sessions', label: 'Counseling sessions', category: 'output', unit: 'sessions', description: 'Individual or group counseling sessions delivered', exampleTarget: '800 sessions per year' },
    { id: 'mh-crisis-interventions', label: 'Crisis interventions', category: 'output', unit: 'interventions', description: 'Crisis calls or interventions handled', exampleTarget: '50 interventions per year' },
    { id: 'mh-support-groups', label: 'Support groups facilitated', category: 'output', unit: 'groups', description: 'Peer support or therapeutic group sessions', exampleTarget: '24 groups per year' },
    { id: 'mh-symptom-reduction', label: 'Symptom reduction', category: 'outcome', unit: 'people', description: 'Clients showing measurable reduction in symptoms', exampleTarget: '75 clients per year' },
    { id: 'mh-functioning-improvement', label: 'Improved daily functioning', category: 'outcome', unit: 'people', description: 'Clients demonstrating improved ability to manage daily life', exampleTarget: '60 clients per year' },
    { id: 'mh-treatment-completion', label: 'Treatment completion rate', category: 'outcome', unit: '%', description: 'Percentage of clients completing treatment plans', exampleTarget: '65–75%' },
    { id: 'mh-stigma-reduction', label: 'Stigma reduction', category: 'outcome', unit: 'people', description: 'Community members with reduced mental health stigma', exampleTarget: '200 people per year' },
    { id: 'mh-access-improvement', label: 'Access to care improved', category: 'impact', unit: 'people', description: 'People in underserved areas gaining access to mental health care', exampleTarget: '100 people per year' },
    { id: 'mh-systemic-integration', label: 'Mental health integrated in systems', category: 'impact', unit: 'systems', description: 'Schools, workplaces, or agencies integrating mental health support', exampleTarget: '2–3 systems per year' },
  ],
}

// ── Workforce Development ──────────────────────────────────────────
const workforce: IssueAreaFramework = {
  slug: 'workforce',
  name: 'Workforce Development',
  metrics: [
    { id: 'wf-participants', label: 'Participants enrolled', category: 'output', unit: 'people', description: 'Individuals enrolled in workforce programs', exampleTarget: '75 participants per year' },
    { id: 'wf-training-hours', label: 'Training hours delivered', category: 'output', unit: 'hours', description: 'Total hours of job training and skill building', exampleTarget: '600 hours per year' },
    { id: 'wf-certifications', label: 'Certifications earned', category: 'output', unit: 'certifications', description: 'Industry certifications or credentials obtained by participants', exampleTarget: '30 certifications per year' },
    { id: 'wf-employer-partnerships', label: 'Employer partnerships', category: 'output', unit: 'partners', description: 'Employers partnering for job placement or internships', exampleTarget: '8–12 partners' },
    { id: 'wf-job-placement', label: 'Job placements', category: 'outcome', unit: 'people', description: 'Participants placed in employment', exampleTarget: '40 placements per year' },
    { id: 'wf-wage-increase', label: 'Average wage increase', category: 'outcome', unit: 'dollars', description: 'Average hourly or annual wage increase among placed participants', exampleTarget: '$2–4/hour increase' },
    { id: 'wf-retention-rate', label: 'Job retention rate (6 months)', category: 'outcome', unit: '%', description: 'Percentage of placed participants still employed after 6 months', exampleTarget: '75–85%' },
    { id: 'wf-career-advancement', label: 'Career advancement', category: 'outcome', unit: 'people', description: 'Participants who received promotions or career growth', exampleTarget: '15 people per year' },
    { id: 'wf-poverty-reduction', label: 'Poverty rate reduction', category: 'impact', unit: '%', description: 'Reduction in poverty rate among program participants', exampleTarget: '10–20% reduction' },
    { id: 'wf-industry-pipeline', label: 'Talent pipeline created', category: 'impact', unit: 'industries', description: 'Industries with improved pipelines of skilled workers', exampleTarget: '2–3 industries' },
  ],
}

// ── Animal Welfare ─────────────────────────────────────────────────
const animalWelfare: IssueAreaFramework = {
  slug: 'animal-welfare',
  name: 'Animal Welfare',
  metrics: [
    { id: 'aw-animals-rescued', label: 'Animals rescued or sheltered', category: 'output', unit: 'animals', description: 'Animals taken in for care or rescue', exampleTarget: '200 animals per year' },
    { id: 'aw-adoptions', label: 'Adoptions completed', category: 'output', unit: 'adoptions', description: 'Animals placed in permanent homes', exampleTarget: '150 adoptions per year' },
    { id: 'aw-spay-neuter', label: 'Spay/neuter surgeries', category: 'output', unit: 'surgeries', description: 'Sterilization procedures performed', exampleTarget: '300 surgeries per year' },
    { id: 'aw-vet-services', label: 'Veterinary services provided', category: 'output', unit: 'services', description: 'Medical treatments, vaccinations, or check-ups provided', exampleTarget: '500 services per year' },
    { id: 'aw-live-release', label: 'Live release rate', category: 'outcome', unit: '%', description: 'Percentage of animals leaving shelter alive (adopted, transferred, returned)', exampleTarget: '85–95%' },
    { id: 'aw-return-rate', label: 'Return rate reduction', category: 'outcome', unit: '%', description: 'Reduction in animals returned after adoption', exampleTarget: '10–15% reduction' },
    { id: 'aw-cruelty-cases', label: 'Cruelty cases investigated', category: 'outcome', unit: 'cases', description: 'Animal cruelty reports investigated and resolved', exampleTarget: '20 cases per year' },
    { id: 'aw-community-education', label: 'Community members educated', category: 'outcome', unit: 'people', description: 'People reached through humane education programs', exampleTarget: '500 people per year' },
    { id: 'aw-stray-reduction', label: 'Stray population reduction', category: 'impact', unit: '%', description: 'Measurable decrease in stray animal population', exampleTarget: '10–20% reduction' },
    { id: 'aw-policy-changes', label: 'Animal welfare policies adopted', category: 'impact', unit: 'policies', description: 'Local or state policies advancing animal protections', exampleTarget: '1–2 policies per year' },
  ],
}

// ── Veterans Services ──────────────────────────────────────────────
const veterans: IssueAreaFramework = {
  slug: 'veterans',
  name: 'Veterans Services',
  metrics: [
    { id: 'vet-veterans-served', label: 'Veterans served', category: 'output', unit: 'people', description: 'Veterans who received services or support', exampleTarget: '150 veterans per year' },
    { id: 'vet-service-hours', label: 'Service hours provided', category: 'output', unit: 'hours', description: 'Total hours of direct services to veterans', exampleTarget: '1,000 hours per year' },
    { id: 'vet-benefits-claims', label: 'Benefits claims assisted', category: 'output', unit: 'claims', description: 'VA or other benefits claims prepared or filed', exampleTarget: '40 claims per year' },
    { id: 'vet-peer-connections', label: 'Peer support connections', category: 'output', unit: 'connections', description: 'Veteran-to-veteran mentoring or support matches', exampleTarget: '30 connections per year' },
    { id: 'vet-employment', label: 'Employment secured', category: 'outcome', unit: 'people', description: 'Veterans placed in employment', exampleTarget: '25 placements per year' },
    { id: 'vet-housing-stability', label: 'Housing stability achieved', category: 'outcome', unit: 'people', description: 'Veterans who achieved stable housing', exampleTarget: '20 veterans per year' },
    { id: 'vet-benefits-awarded', label: 'Benefits successfully awarded', category: 'outcome', unit: 'claims', description: 'Benefits claims resulting in awards', exampleTarget: '30 awards per year' },
    { id: 'vet-mental-health', label: 'Mental health improvement', category: 'outcome', unit: 'people', description: 'Veterans showing improved mental health outcomes', exampleTarget: '40 veterans per year' },
    { id: 'vet-reintegration', label: 'Successful community reintegration', category: 'impact', unit: 'people', description: 'Veterans successfully reintegrated into civilian life', exampleTarget: '20 veterans per year' },
    { id: 'vet-homelessness-prevention', label: 'Veteran homelessness prevented', category: 'impact', unit: 'people', description: 'Veterans kept from experiencing homelessness', exampleTarget: '15 veterans per year' },
  ],
}

// ── Media & Journalism ─────────────────────────────────────────────
const mediaJournalism: IssueAreaFramework = {
  slug: 'media-journalism',
  name: 'Media & Journalism',
  metrics: [
    { id: 'med-stories-published', label: 'Stories or reports published', category: 'output', unit: 'stories', description: 'Articles, investigations, or reports published', exampleTarget: '50 stories per year' },
    { id: 'med-journalists-supported', label: 'Journalists supported', category: 'output', unit: 'journalists', description: 'Reporters or journalists receiving grants, training, or resources', exampleTarget: '10 journalists per year' },
    { id: 'med-trainings', label: 'Trainings delivered', category: 'output', unit: 'trainings', description: 'Media literacy or journalism skill trainings', exampleTarget: '6 trainings per year' },
    { id: 'med-audience-reached', label: 'Audience reached', category: 'output', unit: 'people', description: 'Total readership, viewership, or listenership', exampleTarget: '10,000 people per year' },
    { id: 'med-civic-awareness', label: 'Civic awareness increased', category: 'outcome', unit: 'people', description: 'Audience members with improved civic knowledge', exampleTarget: '500 people per year' },
    { id: 'med-accountability', label: 'Accountability outcomes', category: 'outcome', unit: 'outcomes', description: 'Government or corporate actions prompted by reporting', exampleTarget: '3–5 outcomes per year' },
    { id: 'med-media-diversity', label: 'Media diversity improved', category: 'outcome', unit: 'outlets', description: 'News outlets with more diverse staff or coverage', exampleTarget: '3 outlets per year' },
    { id: 'med-press-freedom', label: 'Press freedom advanced', category: 'impact', unit: 'policies', description: 'Policies or protections advancing press freedom', exampleTarget: '1–2 policies per year' },
    { id: 'med-information-equity', label: 'Information equity improved', category: 'impact', unit: 'communities', description: 'Underserved communities with improved access to information', exampleTarget: '2–3 communities per year' },
  ],
}

// ── Science & Research ─────────────────────────────────────────────
const scienceResearch: IssueAreaFramework = {
  slug: 'science-research',
  name: 'Science & Research',
  metrics: [
    { id: 'sci-papers-published', label: 'Papers or findings published', category: 'output', unit: 'papers', description: 'Research papers, reports, or findings published', exampleTarget: '5–10 papers per year' },
    { id: 'sci-researchers-supported', label: 'Researchers supported', category: 'output', unit: 'researchers', description: 'Scientists or researchers funded or supported', exampleTarget: '8 researchers per year' },
    { id: 'sci-studies-completed', label: 'Studies completed', category: 'output', unit: 'studies', description: 'Research studies brought to completion', exampleTarget: '3–5 studies per year' },
    { id: 'sci-outreach-events', label: 'Public outreach events', category: 'output', unit: 'events', description: 'Science communication or public engagement events', exampleTarget: '6 events per year' },
    { id: 'sci-citations', label: 'Research citations', category: 'outcome', unit: 'citations', description: 'Times research was cited by other scholars', exampleTarget: '25 citations per year' },
    { id: 'sci-stem-pipeline', label: 'STEM pipeline participants', category: 'outcome', unit: 'people', description: 'Students or early-career researchers entering STEM fields', exampleTarget: '15 participants per year' },
    { id: 'sci-knowledge-translation', label: 'Findings translated to practice', category: 'outcome', unit: 'applications', description: 'Research findings applied to real-world practice or policy', exampleTarget: '2–3 applications per year' },
    { id: 'sci-discoveries', label: 'Notable discoveries or innovations', category: 'impact', unit: 'discoveries', description: 'Significant scientific discoveries or technological innovations', exampleTarget: '1–2 per year' },
    { id: 'sci-policy-influence', label: 'Policies influenced by research', category: 'impact', unit: 'policies', description: 'Evidence-based policies adopted due to research', exampleTarget: '1–2 policies per year' },
  ],
}

// ── Community Development ──────────────────────────────────────────
const communityDevelopment: IssueAreaFramework = {
  slug: 'community-development',
  name: 'Community Development',
  metrics: [
    { id: 'cd-residents-served', label: 'Residents served', category: 'output', unit: 'people', description: 'Community members who accessed programs or services', exampleTarget: '300 residents per year' },
    { id: 'cd-projects-completed', label: 'Projects completed', category: 'output', unit: 'projects', description: 'Community improvement projects finished', exampleTarget: '4–6 projects per year' },
    { id: 'cd-meetings-held', label: 'Community meetings held', category: 'output', unit: 'meetings', description: 'Town halls, planning sessions, or community gatherings', exampleTarget: '12 meetings per year' },
    { id: 'cd-partnerships', label: 'Partnerships formed', category: 'output', unit: 'partnerships', description: 'Cross-sector partnerships established', exampleTarget: '5 partnerships per year' },
    { id: 'cd-resident-engagement', label: 'Resident engagement increase', category: 'outcome', unit: '%', description: 'Growth in resident participation in community activities', exampleTarget: '15–25% increase' },
    { id: 'cd-safety-improvement', label: 'Safety improvement', category: 'outcome', unit: '%', description: 'Measured improvement in community safety indicators', exampleTarget: '10–15% improvement' },
    { id: 'cd-property-values', label: 'Property value stabilization', category: 'outcome', unit: '%', description: 'Stabilization or increase in neighborhood property values', exampleTarget: '5–10% stabilization' },
    { id: 'cd-services-access', label: 'Improved access to services', category: 'outcome', unit: 'services', description: 'New community services or improved access to existing ones', exampleTarget: '3–5 new services per year' },
    { id: 'cd-quality-of-life', label: 'Quality of life improvement', category: 'impact', unit: '%', description: 'Measured improvement in quality of life indicators', exampleTarget: '10–15% improvement' },
    { id: 'cd-community-resilience', label: 'Community resilience strengthened', category: 'impact', unit: 'communities', description: 'Communities better able to withstand and recover from challenges', exampleTarget: '2 communities per year' },
  ],
}

// ── Master lookup ──────────────────────────────────────────────────

export const METRIC_FRAMEWORKS: IssueAreaFramework[] = [
  education,
  health,
  environment,
  artsCulture,
  economicDevelopment,
  socialJustice,
  youthDevelopment,
  housing,
  foodAgriculture,
  technology,
  civicEngagement,
  international,
  disability,
  mentalHealth,
  workforce,
  animalWelfare,
  veterans,
  mediaJournalism,
  scienceResearch,
  communityDevelopment,
]

/**
 * Get the metric framework for a specific issue area.
 */
export function getFramework(slug: string): IssueAreaFramework | undefined {
  return METRIC_FRAMEWORKS.find((f) => f.slug === slug)
}

/**
 * Given a list of metric IDs and an issue area slug, return the
 * matching MetricDefinition objects in their original order.
 */
export function getMetricDefinitions(
  slug: string,
  metricIds: string[],
): MetricDefinition[] {
  const framework = getFramework(slug)
  if (!framework) return []
  const idSet = new Set(metricIds)
  return framework.metrics.filter((m) => idSet.has(m.id))
}

/** Helper: category display labels */
export const CATEGORY_LABELS: Record<MetricCategory, string> = {
  output: 'Outputs',
  outcome: 'Outcomes',
  impact: 'Impact',
}

export const CATEGORY_DESCRIPTIONS: Record<MetricCategory, string> = {
  output: 'Direct, countable results of your activities',
  outcome: 'Measurable changes in knowledge, behavior, or condition',
  impact: 'Longer-term systemic or community-level change',
}
