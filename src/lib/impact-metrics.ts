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
    { id: 'edu-students-served', label: 'Students served', category: 'output', unit: 'people', description: 'Total number of students who participated in programs' },
    { id: 'edu-sessions-delivered', label: 'Sessions or classes delivered', category: 'output', unit: 'sessions', description: 'Number of teaching sessions, workshops, or classes held' },
    { id: 'edu-hours-instruction', label: 'Hours of instruction', category: 'output', unit: 'hours', description: 'Total instructional hours delivered across all programs' },
    { id: 'edu-materials-distributed', label: 'Learning materials distributed', category: 'output', unit: 'items', description: 'Books, supplies, or digital resources provided' },
    { id: 'edu-completion-rate', label: 'Program completion rate', category: 'outcome', unit: '%', description: 'Percentage of enrolled students who completed the program' },
    { id: 'edu-skill-gain', label: 'Students showing skill improvement', category: 'outcome', unit: 'people', description: 'Students who demonstrated measurable skill gains via assessment' },
    { id: 'edu-grade-improvement', label: 'Students with grade improvement', category: 'outcome', unit: 'people', description: 'Students whose grades improved after participation' },
    { id: 'edu-graduation-rate', label: 'Graduation or advancement rate', category: 'outcome', unit: '%', description: 'Percentage of participants who graduated or advanced to the next level' },
    { id: 'edu-college-enrollment', label: 'Post-secondary enrollment', category: 'impact', unit: 'people', description: 'Participants who enrolled in college or further education' },
    { id: 'edu-career-placement', label: 'Career or job placement', category: 'impact', unit: 'people', description: 'Participants who secured employment related to their studies' },
  ],
}

// ── Health & Wellness ──────────────────────────────────────────────
const health: IssueAreaFramework = {
  slug: 'health',
  name: 'Health & Wellness',
  metrics: [
    { id: 'hlt-patients-served', label: 'Patients or clients served', category: 'output', unit: 'people', description: 'Total individuals who received health services' },
    { id: 'hlt-screenings', label: 'Health screenings conducted', category: 'output', unit: 'screenings', description: 'Number of preventive screenings or assessments performed' },
    { id: 'hlt-visits', label: 'Service visits or appointments', category: 'output', unit: 'visits', description: 'Total clinical or service visits delivered' },
    { id: 'hlt-referrals', label: 'Referrals to care', category: 'output', unit: 'referrals', description: 'Number of referrals made to specialists or follow-up care' },
    { id: 'hlt-health-improvement', label: 'Clients showing health improvement', category: 'outcome', unit: 'people', description: 'Clients who showed measurable improvement in health indicators' },
    { id: 'hlt-behavior-change', label: 'Clients adopting healthier behaviors', category: 'outcome', unit: 'people', description: 'Clients who reported or demonstrated healthier lifestyle changes' },
    { id: 'hlt-insurance-enrollment', label: 'Insurance enrollment assisted', category: 'outcome', unit: 'people', description: 'Individuals helped to enroll in health insurance' },
    { id: 'hlt-er-reduction', label: 'Reduction in ER visits', category: 'impact', unit: '%', description: 'Decrease in emergency room visits among participants' },
    { id: 'hlt-chronic-management', label: 'Chronic condition management', category: 'impact', unit: 'people', description: 'Patients successfully managing chronic conditions' },
    { id: 'hlt-community-health', label: 'Community health indicators improved', category: 'impact', unit: 'indicators', description: 'Population-level health measures that have improved' },
  ],
}

// ── Environment & Climate ──────────────────────────────────────────
const environment: IssueAreaFramework = {
  slug: 'environment',
  name: 'Environment & Climate',
  metrics: [
    { id: 'env-acres-conserved', label: 'Acres or hectares conserved', category: 'output', unit: 'acres', description: 'Land area protected, restored, or conserved' },
    { id: 'env-trees-planted', label: 'Trees planted', category: 'output', unit: 'trees', description: 'Number of trees planted or restored' },
    { id: 'env-volunteers', label: 'Volunteers engaged', category: 'output', unit: 'people', description: 'Number of volunteers participating in environmental activities' },
    { id: 'env-events', label: 'Events or cleanups held', category: 'output', unit: 'events', description: 'Community cleanups, workshops, or advocacy events' },
    { id: 'env-waste-diverted', label: 'Waste diverted from landfill', category: 'outcome', unit: 'tons', description: 'Tons of waste recycled, composted, or reused' },
    { id: 'env-emissions-reduced', label: 'Carbon emissions reduced', category: 'outcome', unit: 'metric tons CO₂', description: 'Estimated reduction in greenhouse gas emissions' },
    { id: 'env-water-quality', label: 'Water quality improvement', category: 'outcome', unit: 'sites', description: 'Number of water bodies or sites showing improved quality' },
    { id: 'env-species-protected', label: 'Species or habitats protected', category: 'outcome', unit: 'species', description: 'Number of at-risk species or habitats with improved protections' },
    { id: 'env-policy-influence', label: 'Policies influenced', category: 'impact', unit: 'policies', description: 'Environmental policies adopted or strengthened' },
    { id: 'env-community-resilience', label: 'Communities with improved resilience', category: 'impact', unit: 'communities', description: 'Communities better prepared for environmental challenges' },
  ],
}

// ── Arts & Culture ─────────────────────────────────────────────────
const artsCulture: IssueAreaFramework = {
  slug: 'arts-culture',
  name: 'Arts & Culture',
  metrics: [
    { id: 'art-attendees', label: 'Event attendees', category: 'output', unit: 'people', description: 'Total attendance across performances, exhibitions, or events' },
    { id: 'art-programs-offered', label: 'Programs or exhibitions offered', category: 'output', unit: 'programs', description: 'Number of artistic programs, shows, or exhibitions' },
    { id: 'art-artists-supported', label: 'Artists supported', category: 'output', unit: 'artists', description: 'Number of artists who received support, grants, or platforms' },
    { id: 'art-workshops', label: 'Workshops or classes held', category: 'output', unit: 'workshops', description: 'Art education sessions, masterclasses, or workshops' },
    { id: 'art-participant-growth', label: 'Creative skill development', category: 'outcome', unit: 'people', description: 'Participants who demonstrated artistic or creative skill growth' },
    { id: 'art-community-engagement', label: 'Community engagement increase', category: 'outcome', unit: '%', description: 'Growth in community participation in arts programming' },
    { id: 'art-revenue-generated', label: 'Revenue generated for artists', category: 'outcome', unit: 'dollars', description: 'Income generated for participating artists through programming' },
    { id: 'art-cultural-preservation', label: 'Cultural traditions preserved', category: 'impact', unit: 'traditions', description: 'Cultural practices, languages, or traditions documented or sustained' },
    { id: 'art-access-equity', label: 'Access equity improved', category: 'impact', unit: 'communities', description: 'Underserved communities gaining access to arts programming' },
  ],
}

// ── Economic Development ───────────────────────────────────────────
const economicDevelopment: IssueAreaFramework = {
  slug: 'economic-development',
  name: 'Economic Development',
  metrics: [
    { id: 'econ-businesses-assisted', label: 'Businesses assisted', category: 'output', unit: 'businesses', description: 'Number of businesses receiving technical assistance or support' },
    { id: 'econ-loans-grants', label: 'Loans or micro-grants issued', category: 'output', unit: 'awards', description: 'Number of financial awards distributed to entrepreneurs' },
    { id: 'econ-training-hours', label: 'Training hours delivered', category: 'output', unit: 'hours', description: 'Hours of business training, financial literacy, or coaching' },
    { id: 'econ-participants', label: 'Program participants', category: 'output', unit: 'people', description: 'Individuals who participated in economic programs' },
    { id: 'econ-jobs-created', label: 'Jobs created', category: 'outcome', unit: 'jobs', description: 'New jobs created by supported businesses' },
    { id: 'econ-revenue-growth', label: 'Business revenue growth', category: 'outcome', unit: 'dollars', description: 'Aggregate revenue increase among assisted businesses' },
    { id: 'econ-business-survival', label: 'Business survival rate', category: 'outcome', unit: '%', description: 'Percentage of supported businesses still operating after 1+ years' },
    { id: 'econ-income-increase', label: 'Participant income increase', category: 'outcome', unit: 'dollars', description: 'Average income increase among program participants' },
    { id: 'econ-wealth-gap', label: 'Wealth gap reduction', category: 'impact', unit: '%', description: 'Measurable reduction in economic disparities in target area' },
    { id: 'econ-community-investment', label: 'Community investment attracted', category: 'impact', unit: 'dollars', description: 'Additional investment dollars attracted to the community' },
  ],
}

// ── Social Justice & Equity ────────────────────────────────────────
const socialJustice: IssueAreaFramework = {
  slug: 'social-justice',
  name: 'Social Justice & Equity',
  metrics: [
    { id: 'sj-individuals-served', label: 'Individuals served', category: 'output', unit: 'people', description: 'People who received direct services or support' },
    { id: 'sj-legal-cases', label: 'Legal cases or consultations', category: 'output', unit: 'cases', description: 'Legal representation, know-your-rights consultations, or cases' },
    { id: 'sj-trainings', label: 'Trainings or workshops held', category: 'output', unit: 'trainings', description: 'Educational sessions on equity, rights, or advocacy' },
    { id: 'sj-campaigns', label: 'Advocacy campaigns launched', category: 'output', unit: 'campaigns', description: 'Public awareness or advocacy campaigns' },
    { id: 'sj-legal-outcomes', label: 'Favorable legal outcomes', category: 'outcome', unit: 'cases', description: 'Cases resulting in positive resolution for clients' },
    { id: 'sj-awareness-increase', label: 'Awareness or knowledge increase', category: 'outcome', unit: '%', description: 'Measured increase in rights awareness among participants' },
    { id: 'sj-voter-registration', label: 'Voter registrations', category: 'outcome', unit: 'registrations', description: 'New voter registrations facilitated' },
    { id: 'sj-policy-changes', label: 'Policy changes achieved', category: 'impact', unit: 'policies', description: 'Laws, policies, or practices changed through advocacy' },
    { id: 'sj-systemic-change', label: 'Systemic barriers reduced', category: 'impact', unit: 'barriers', description: 'Institutional barriers identified and addressed' },
  ],
}

// ── Youth Development ──────────────────────────────────────────────
const youthDevelopment: IssueAreaFramework = {
  slug: 'youth-development',
  name: 'Youth Development',
  metrics: [
    { id: 'yth-youth-served', label: 'Youth served', category: 'output', unit: 'people', description: 'Number of young people participating in programs' },
    { id: 'yth-mentoring-hours', label: 'Mentoring hours', category: 'output', unit: 'hours', description: 'Total hours of mentoring provided' },
    { id: 'yth-activities-offered', label: 'Activities or programs offered', category: 'output', unit: 'programs', description: 'Number of distinct youth programs or activities' },
    { id: 'yth-families-engaged', label: 'Families engaged', category: 'output', unit: 'families', description: 'Families who participated in family engagement activities' },
    { id: 'yth-leadership-skills', label: 'Youth showing leadership growth', category: 'outcome', unit: 'people', description: 'Young people demonstrating improved leadership abilities' },
    { id: 'yth-academic-improvement', label: 'Academic improvement', category: 'outcome', unit: 'people', description: 'Youth who showed measurable academic progress' },
    { id: 'yth-retention', label: 'Program retention rate', category: 'outcome', unit: '%', description: 'Percentage of youth who stayed engaged throughout the program' },
    { id: 'yth-behavioral-improvement', label: 'Behavioral improvement', category: 'outcome', unit: 'people', description: 'Youth with reduced behavioral incidents or improved social skills' },
    { id: 'yth-college-career', label: 'College or career readiness', category: 'impact', unit: 'people', description: 'Youth who achieved college or career readiness milestones' },
    { id: 'yth-community-contribution', label: 'Community service hours by youth', category: 'impact', unit: 'hours', description: 'Volunteer hours contributed by program participants' },
  ],
}

// ── Housing & Homelessness ─────────────────────────────────────────
const housing: IssueAreaFramework = {
  slug: 'housing',
  name: 'Housing & Homelessness',
  metrics: [
    { id: 'hsg-individuals-housed', label: 'Individuals housed', category: 'output', unit: 'people', description: 'People placed into permanent or transitional housing' },
    { id: 'hsg-shelter-nights', label: 'Shelter nights provided', category: 'output', unit: 'nights', description: 'Total emergency shelter bed-nights' },
    { id: 'hsg-units-built', label: 'Housing units built or rehabilitated', category: 'output', unit: 'units', description: 'Affordable housing units constructed or renovated' },
    { id: 'hsg-case-management', label: 'Case management sessions', category: 'output', unit: 'sessions', description: 'Individual case management meetings held' },
    { id: 'hsg-housing-retention', label: 'Housing retention rate (6 months)', category: 'outcome', unit: '%', description: 'Percentage of placed individuals still housed after 6 months' },
    { id: 'hsg-income-stability', label: 'Income stability achieved', category: 'outcome', unit: 'people', description: 'Clients who achieved stable income or employment' },
    { id: 'hsg-eviction-prevention', label: 'Evictions prevented', category: 'outcome', unit: 'households', description: 'Households that avoided eviction through intervention' },
    { id: 'hsg-self-sufficiency', label: 'Clients achieving self-sufficiency', category: 'outcome', unit: 'people', description: 'Individuals transitioning off support services' },
    { id: 'hsg-homelessness-reduction', label: 'Reduction in local homelessness', category: 'impact', unit: '%', description: 'Measured decrease in homelessness in service area' },
    { id: 'hsg-affordable-stock', label: 'Affordable housing stock increase', category: 'impact', unit: 'units', description: 'Net increase in affordable units in community' },
  ],
}

// ── Food & Agriculture ─────────────────────────────────────────────
const foodAgriculture: IssueAreaFramework = {
  slug: 'food-agriculture',
  name: 'Food & Agriculture',
  metrics: [
    { id: 'food-meals-provided', label: 'Meals or food boxes provided', category: 'output', unit: 'meals', description: 'Total meals served or food boxes distributed' },
    { id: 'food-people-served', label: 'People served', category: 'output', unit: 'people', description: 'Individuals who received food assistance' },
    { id: 'food-pounds-distributed', label: 'Pounds of food distributed', category: 'output', unit: 'pounds', description: 'Total weight of food distributed' },
    { id: 'food-garden-sites', label: 'Garden or farm sites operated', category: 'output', unit: 'sites', description: 'Community gardens, farms, or food production sites' },
    { id: 'food-insecurity-reduction', label: 'Food insecurity reduction', category: 'outcome', unit: 'people', description: 'People who reported reduced food insecurity' },
    { id: 'food-nutrition-knowledge', label: 'Nutrition knowledge improved', category: 'outcome', unit: 'people', description: 'Participants with improved understanding of healthy eating' },
    { id: 'food-local-sourcing', label: 'Local food sourcing increase', category: 'outcome', unit: '%', description: 'Increase in locally sourced food in distribution' },
    { id: 'food-waste-reduced', label: 'Food waste reduced', category: 'outcome', unit: 'pounds', description: 'Pounds of food rescued from waste' },
    { id: 'food-food-access', label: 'Communities with improved food access', category: 'impact', unit: 'communities', description: 'Food deserts or low-access areas with improved options' },
    { id: 'food-system-change', label: 'Food system policy changes', category: 'impact', unit: 'policies', description: 'Policies advancing food justice or local food systems' },
  ],
}

// ── Technology & Innovation ────────────────────────────────────────
const technology: IssueAreaFramework = {
  slug: 'technology',
  name: 'Technology & Innovation',
  metrics: [
    { id: 'tech-people-trained', label: 'People trained', category: 'output', unit: 'people', description: 'Individuals who completed technology training' },
    { id: 'tech-devices-distributed', label: 'Devices distributed', category: 'output', unit: 'devices', description: 'Computers, tablets, or devices provided' },
    { id: 'tech-programs-offered', label: 'Programs or courses offered', category: 'output', unit: 'programs', description: 'Technology education courses or workshops' },
    { id: 'tech-connectivity', label: 'Broadband connections enabled', category: 'output', unit: 'connections', description: 'Households or individuals connected to internet' },
    { id: 'tech-literacy-improvement', label: 'Digital literacy improvement', category: 'outcome', unit: 'people', description: 'Participants with measurable gains in digital skills' },
    { id: 'tech-certification', label: 'Certifications earned', category: 'outcome', unit: 'certifications', description: 'Industry-recognized certifications achieved' },
    { id: 'tech-employment', label: 'Tech employment secured', category: 'outcome', unit: 'people', description: 'Participants who secured technology-related employment' },
    { id: 'tech-digital-divide', label: 'Digital divide reduction', category: 'impact', unit: 'communities', description: 'Communities with measurably reduced digital disparities' },
    { id: 'tech-innovation-launched', label: 'Solutions or tools launched', category: 'impact', unit: 'solutions', description: 'Technology solutions deployed to address community needs' },
  ],
}

// ── Civic Engagement ───────────────────────────────────────────────
const civicEngagement: IssueAreaFramework = {
  slug: 'civic-engagement',
  name: 'Civic Engagement',
  metrics: [
    { id: 'civ-people-engaged', label: 'People engaged', category: 'output', unit: 'people', description: 'Individuals who participated in civic activities' },
    { id: 'civ-events-held', label: 'Events or forums held', category: 'output', unit: 'events', description: 'Town halls, forums, or civic education events' },
    { id: 'civ-voter-contacts', label: 'Voter contacts made', category: 'output', unit: 'contacts', description: 'Outreach touches via door-knocking, calls, or texts' },
    { id: 'civ-registrations', label: 'Voter registrations', category: 'output', unit: 'registrations', description: 'New voter registrations facilitated' },
    { id: 'civ-turnout-increase', label: 'Voter turnout increase', category: 'outcome', unit: '%', description: 'Increase in voter participation in target areas' },
    { id: 'civ-civic-knowledge', label: 'Civic knowledge improvement', category: 'outcome', unit: 'people', description: 'Participants with increased understanding of civic processes' },
    { id: 'civ-community-leaders', label: 'Community leaders developed', category: 'outcome', unit: 'people', description: 'New community leaders emerging from programs' },
    { id: 'civ-policy-input', label: 'Community input in policy processes', category: 'impact', unit: 'processes', description: 'Policy decisions with meaningful community participation' },
    { id: 'civ-representation', label: 'Increased representation', category: 'impact', unit: 'positions', description: 'Underrepresented groups gaining elected or appointed positions' },
  ],
}

// ── International Development ──────────────────────────────────────
const international: IssueAreaFramework = {
  slug: 'international',
  name: 'International Development',
  metrics: [
    { id: 'intl-beneficiaries', label: 'Beneficiaries reached', category: 'output', unit: 'people', description: 'Individuals directly benefiting from programs' },
    { id: 'intl-communities-served', label: 'Communities served', category: 'output', unit: 'communities', description: 'Number of communities receiving support' },
    { id: 'intl-projects-completed', label: 'Projects completed', category: 'output', unit: 'projects', description: 'Infrastructure, education, or health projects finished' },
    { id: 'intl-local-partners', label: 'Local partners engaged', category: 'output', unit: 'partners', description: 'Local organizations partnered with for implementation' },
    { id: 'intl-capacity-built', label: 'Local capacity strengthened', category: 'outcome', unit: 'organizations', description: 'Local organizations with increased operational capacity' },
    { id: 'intl-health-outcomes', label: 'Health outcomes improved', category: 'outcome', unit: 'people', description: 'People with measurably improved health indicators' },
    { id: 'intl-education-access', label: 'Education access expanded', category: 'outcome', unit: 'people', description: 'Children or adults gaining access to education' },
    { id: 'intl-economic-improvement', label: 'Economic improvement', category: 'outcome', unit: 'households', description: 'Households with measurable economic gains' },
    { id: 'intl-sustainability', label: 'Program sustainability achieved', category: 'impact', unit: 'programs', description: 'Programs successfully transitioned to local ownership' },
    { id: 'intl-sdg-contribution', label: 'SDG indicators advanced', category: 'impact', unit: 'indicators', description: 'UN Sustainable Development Goal indicators improved' },
  ],
}

// ── Disability Rights ──────────────────────────────────────────────
const disability: IssueAreaFramework = {
  slug: 'disability',
  name: 'Disability Rights',
  metrics: [
    { id: 'dis-individuals-served', label: 'Individuals served', category: 'output', unit: 'people', description: 'People with disabilities receiving services or support' },
    { id: 'dis-accommodations', label: 'Accommodations facilitated', category: 'output', unit: 'accommodations', description: 'Workplace, educational, or public accommodations secured' },
    { id: 'dis-trainings', label: 'Accessibility trainings delivered', category: 'output', unit: 'trainings', description: 'Trainings on disability rights, accessibility, or inclusion' },
    { id: 'dis-advocacy-actions', label: 'Advocacy actions taken', category: 'output', unit: 'actions', description: 'Letters, meetings, or campaigns for disability rights' },
    { id: 'dis-employment', label: 'Employment secured', category: 'outcome', unit: 'people', description: 'Individuals with disabilities who secured employment' },
    { id: 'dis-independence', label: 'Independent living achieved', category: 'outcome', unit: 'people', description: 'People transitioned to independent living arrangements' },
    { id: 'dis-accessibility-improvements', label: 'Accessibility improvements made', category: 'outcome', unit: 'improvements', description: 'Physical or digital accessibility barriers removed' },
    { id: 'dis-inclusion-policies', label: 'Inclusion policies adopted', category: 'impact', unit: 'policies', description: 'Organizations adopting disability inclusion policies' },
    { id: 'dis-rights-awareness', label: 'Rights awareness increased', category: 'impact', unit: 'people', description: 'People with improved knowledge of disability rights' },
  ],
}

// ── Mental Health ──────────────────────────────────────────────────
const mentalHealth: IssueAreaFramework = {
  slug: 'mental-health',
  name: 'Mental Health',
  metrics: [
    { id: 'mh-clients-served', label: 'Clients served', category: 'output', unit: 'people', description: 'Individuals receiving mental health services' },
    { id: 'mh-counseling-sessions', label: 'Counseling sessions', category: 'output', unit: 'sessions', description: 'Individual or group counseling sessions delivered' },
    { id: 'mh-crisis-interventions', label: 'Crisis interventions', category: 'output', unit: 'interventions', description: 'Crisis calls or interventions handled' },
    { id: 'mh-support-groups', label: 'Support groups facilitated', category: 'output', unit: 'groups', description: 'Peer support or therapeutic group sessions' },
    { id: 'mh-symptom-reduction', label: 'Symptom reduction', category: 'outcome', unit: 'people', description: 'Clients showing measurable reduction in symptoms' },
    { id: 'mh-functioning-improvement', label: 'Improved daily functioning', category: 'outcome', unit: 'people', description: 'Clients demonstrating improved ability to manage daily life' },
    { id: 'mh-treatment-completion', label: 'Treatment completion rate', category: 'outcome', unit: '%', description: 'Percentage of clients completing treatment plans' },
    { id: 'mh-stigma-reduction', label: 'Stigma reduction', category: 'outcome', unit: 'people', description: 'Community members with reduced mental health stigma' },
    { id: 'mh-access-improvement', label: 'Access to care improved', category: 'impact', unit: 'people', description: 'People in underserved areas gaining access to mental health care' },
    { id: 'mh-systemic-integration', label: 'Mental health integrated in systems', category: 'impact', unit: 'systems', description: 'Schools, workplaces, or agencies integrating mental health support' },
  ],
}

// ── Workforce Development ──────────────────────────────────────────
const workforce: IssueAreaFramework = {
  slug: 'workforce',
  name: 'Workforce Development',
  metrics: [
    { id: 'wf-participants', label: 'Participants enrolled', category: 'output', unit: 'people', description: 'Individuals enrolled in workforce programs' },
    { id: 'wf-training-hours', label: 'Training hours delivered', category: 'output', unit: 'hours', description: 'Total hours of job training and skill building' },
    { id: 'wf-certifications', label: 'Certifications earned', category: 'output', unit: 'certifications', description: 'Industry certifications or credentials obtained by participants' },
    { id: 'wf-employer-partnerships', label: 'Employer partnerships', category: 'output', unit: 'partners', description: 'Employers partnering for job placement or internships' },
    { id: 'wf-job-placement', label: 'Job placements', category: 'outcome', unit: 'people', description: 'Participants placed in employment' },
    { id: 'wf-wage-increase', label: 'Average wage increase', category: 'outcome', unit: 'dollars', description: 'Average hourly or annual wage increase among placed participants' },
    { id: 'wf-retention-rate', label: 'Job retention rate (6 months)', category: 'outcome', unit: '%', description: 'Percentage of placed participants still employed after 6 months' },
    { id: 'wf-career-advancement', label: 'Career advancement', category: 'outcome', unit: 'people', description: 'Participants who received promotions or career growth' },
    { id: 'wf-poverty-reduction', label: 'Poverty rate reduction', category: 'impact', unit: '%', description: 'Reduction in poverty rate among program participants' },
    { id: 'wf-industry-pipeline', label: 'Talent pipeline created', category: 'impact', unit: 'industries', description: 'Industries with improved pipelines of skilled workers' },
  ],
}

// ── Animal Welfare ─────────────────────────────────────────────────
const animalWelfare: IssueAreaFramework = {
  slug: 'animal-welfare',
  name: 'Animal Welfare',
  metrics: [
    { id: 'aw-animals-rescued', label: 'Animals rescued or sheltered', category: 'output', unit: 'animals', description: 'Animals taken in for care or rescue' },
    { id: 'aw-adoptions', label: 'Adoptions completed', category: 'output', unit: 'adoptions', description: 'Animals placed in permanent homes' },
    { id: 'aw-spay-neuter', label: 'Spay/neuter surgeries', category: 'output', unit: 'surgeries', description: 'Sterilization procedures performed' },
    { id: 'aw-vet-services', label: 'Veterinary services provided', category: 'output', unit: 'services', description: 'Medical treatments, vaccinations, or check-ups provided' },
    { id: 'aw-live-release', label: 'Live release rate', category: 'outcome', unit: '%', description: 'Percentage of animals leaving shelter alive (adopted, transferred, returned)' },
    { id: 'aw-return-rate', label: 'Return rate reduction', category: 'outcome', unit: '%', description: 'Reduction in animals returned after adoption' },
    { id: 'aw-cruelty-cases', label: 'Cruelty cases investigated', category: 'outcome', unit: 'cases', description: 'Animal cruelty reports investigated and resolved' },
    { id: 'aw-community-education', label: 'Community members educated', category: 'outcome', unit: 'people', description: 'People reached through humane education programs' },
    { id: 'aw-stray-reduction', label: 'Stray population reduction', category: 'impact', unit: '%', description: 'Measurable decrease in stray animal population' },
    { id: 'aw-policy-changes', label: 'Animal welfare policies adopted', category: 'impact', unit: 'policies', description: 'Local or state policies advancing animal protections' },
  ],
}

// ── Veterans Services ──────────────────────────────────────────────
const veterans: IssueAreaFramework = {
  slug: 'veterans',
  name: 'Veterans Services',
  metrics: [
    { id: 'vet-veterans-served', label: 'Veterans served', category: 'output', unit: 'people', description: 'Veterans who received services or support' },
    { id: 'vet-service-hours', label: 'Service hours provided', category: 'output', unit: 'hours', description: 'Total hours of direct services to veterans' },
    { id: 'vet-benefits-claims', label: 'Benefits claims assisted', category: 'output', unit: 'claims', description: 'VA or other benefits claims prepared or filed' },
    { id: 'vet-peer-connections', label: 'Peer support connections', category: 'output', unit: 'connections', description: 'Veteran-to-veteran mentoring or support matches' },
    { id: 'vet-employment', label: 'Employment secured', category: 'outcome', unit: 'people', description: 'Veterans placed in employment' },
    { id: 'vet-housing-stability', label: 'Housing stability achieved', category: 'outcome', unit: 'people', description: 'Veterans who achieved stable housing' },
    { id: 'vet-benefits-awarded', label: 'Benefits successfully awarded', category: 'outcome', unit: 'claims', description: 'Benefits claims resulting in awards' },
    { id: 'vet-mental-health', label: 'Mental health improvement', category: 'outcome', unit: 'people', description: 'Veterans showing improved mental health outcomes' },
    { id: 'vet-reintegration', label: 'Successful community reintegration', category: 'impact', unit: 'people', description: 'Veterans successfully reintegrated into civilian life' },
    { id: 'vet-homelessness-prevention', label: 'Veteran homelessness prevented', category: 'impact', unit: 'people', description: 'Veterans kept from experiencing homelessness' },
  ],
}

// ── Media & Journalism ─────────────────────────────────────────────
const mediaJournalism: IssueAreaFramework = {
  slug: 'media-journalism',
  name: 'Media & Journalism',
  metrics: [
    { id: 'med-stories-published', label: 'Stories or reports published', category: 'output', unit: 'stories', description: 'Articles, investigations, or reports published' },
    { id: 'med-journalists-supported', label: 'Journalists supported', category: 'output', unit: 'journalists', description: 'Reporters or journalists receiving grants, training, or resources' },
    { id: 'med-trainings', label: 'Trainings delivered', category: 'output', unit: 'trainings', description: 'Media literacy or journalism skill trainings' },
    { id: 'med-audience-reached', label: 'Audience reached', category: 'output', unit: 'people', description: 'Total readership, viewership, or listenership' },
    { id: 'med-civic-awareness', label: 'Civic awareness increased', category: 'outcome', unit: 'people', description: 'Audience members with improved civic knowledge' },
    { id: 'med-accountability', label: 'Accountability outcomes', category: 'outcome', unit: 'outcomes', description: 'Government or corporate actions prompted by reporting' },
    { id: 'med-media-diversity', label: 'Media diversity improved', category: 'outcome', unit: 'outlets', description: 'News outlets with more diverse staff or coverage' },
    { id: 'med-press-freedom', label: 'Press freedom advanced', category: 'impact', unit: 'policies', description: 'Policies or protections advancing press freedom' },
    { id: 'med-information-equity', label: 'Information equity improved', category: 'impact', unit: 'communities', description: 'Underserved communities with improved access to information' },
  ],
}

// ── Science & Research ─────────────────────────────────────────────
const scienceResearch: IssueAreaFramework = {
  slug: 'science-research',
  name: 'Science & Research',
  metrics: [
    { id: 'sci-papers-published', label: 'Papers or findings published', category: 'output', unit: 'papers', description: 'Research papers, reports, or findings published' },
    { id: 'sci-researchers-supported', label: 'Researchers supported', category: 'output', unit: 'researchers', description: 'Scientists or researchers funded or supported' },
    { id: 'sci-studies-completed', label: 'Studies completed', category: 'output', unit: 'studies', description: 'Research studies brought to completion' },
    { id: 'sci-outreach-events', label: 'Public outreach events', category: 'output', unit: 'events', description: 'Science communication or public engagement events' },
    { id: 'sci-citations', label: 'Research citations', category: 'outcome', unit: 'citations', description: 'Times research was cited by other scholars' },
    { id: 'sci-stem-pipeline', label: 'STEM pipeline participants', category: 'outcome', unit: 'people', description: 'Students or early-career researchers entering STEM fields' },
    { id: 'sci-knowledge-translation', label: 'Findings translated to practice', category: 'outcome', unit: 'applications', description: 'Research findings applied to real-world practice or policy' },
    { id: 'sci-discoveries', label: 'Notable discoveries or innovations', category: 'impact', unit: 'discoveries', description: 'Significant scientific discoveries or technological innovations' },
    { id: 'sci-policy-influence', label: 'Policies influenced by research', category: 'impact', unit: 'policies', description: 'Evidence-based policies adopted due to research' },
  ],
}

// ── Community Development ──────────────────────────────────────────
const communityDevelopment: IssueAreaFramework = {
  slug: 'community-development',
  name: 'Community Development',
  metrics: [
    { id: 'cd-residents-served', label: 'Residents served', category: 'output', unit: 'people', description: 'Community members who accessed programs or services' },
    { id: 'cd-projects-completed', label: 'Projects completed', category: 'output', unit: 'projects', description: 'Community improvement projects finished' },
    { id: 'cd-meetings-held', label: 'Community meetings held', category: 'output', unit: 'meetings', description: 'Town halls, planning sessions, or community gatherings' },
    { id: 'cd-partnerships', label: 'Partnerships formed', category: 'output', unit: 'partnerships', description: 'Cross-sector partnerships established' },
    { id: 'cd-resident-engagement', label: 'Resident engagement increase', category: 'outcome', unit: '%', description: 'Growth in resident participation in community activities' },
    { id: 'cd-safety-improvement', label: 'Safety improvement', category: 'outcome', unit: '%', description: 'Measured improvement in community safety indicators' },
    { id: 'cd-property-values', label: 'Property value stabilization', category: 'outcome', unit: '%', description: 'Stabilization or increase in neighborhood property values' },
    { id: 'cd-services-access', label: 'Improved access to services', category: 'outcome', unit: 'services', description: 'New community services or improved access to existing ones' },
    { id: 'cd-quality-of-life', label: 'Quality of life improvement', category: 'impact', unit: '%', description: 'Measured improvement in quality of life indicators' },
    { id: 'cd-community-resilience', label: 'Community resilience strengthened', category: 'impact', unit: 'communities', description: 'Communities better able to withstand and recover from challenges' },
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
