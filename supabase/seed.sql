-- Seed after creating these users through Supabase Auth (Google OAuth or the dashboard).
-- User IDs are deterministic to keep this file repeatable and reviewable.
-- Replace/create the two Auth users with these UUIDs in local development first.
insert into public.profiles(id,role,full_name,email,region,onboarded) values
 ('10000000-0000-4000-8000-000000000001','student','Arjun Rao','arjun.demo@example.test','Bengaluru, India',true),
 ('10000000-0000-4000-8000-000000000002','organizer','Nisha Shah','nisha.demo@example.test','Bengaluru, India',true)
on conflict(id) do nothing;

insert into public.student_details(profile_id,college,usn,aadhaar_last4,bio) values
 ('10000000-0000-4000-8000-000000000001','PES University','PES1UG23CS001','4821','Building technology for people and the places they call home.')
on conflict(profile_id) do nothing;
insert into public.organizer_details(profile_id,org_name,org_type,designation,work_email,website) values
 ('10000000-0000-4000-8000-000000000002','Northstar Ventures','recruiter','Talent Partner','nisha@northstar.example','https://northstar.example')
on conflict(profile_id) do nothing;

insert into public.hackathons(id,student_id,name,organizer_name,location,event_date,summary_line,description,github_url,result,tags) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Build for Bharat','Google Developer Groups','Bengaluru, India','2025-03-15','Built a multilingual assistant that helps citizens find local public services.','Designed and built a multilingual public-service navigator that helps citizens discover nearby government schemes. Our team shipped a voice-first prototype in Kannada and English using retrieval augmented generation.','https://github.com/arjunrao/seva','Finalist',array['AI / ML','Civic tech']),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Hack the Climate','Climate Collective','Online','2024-11-08','Created a community map for neighborhood climate action.','A collaborative map bringing local climate initiatives into one place. Residents can find nearby projects, join community events and track small changes over time.',null,null,array['Climate','Web'])
on conflict(id) do nothing;

insert into public.teams(id,name,created_by) values
 ('30000000-0000-4000-8000-000000000001','Monsoon Makers','10000000-0000-4000-8000-000000000001') on conflict(id) do nothing;
insert into public.team_members(team_id,student_id,status,invited_email) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','active','arjun.demo@example.test') on conflict(team_id,student_id) do nothing;
insert into public.team_projects(id,team_id,title,summary_line,description) values
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Seva — services, closer to home','A multilingual guide to public services built for every neighborhood.','Seva brings local government services, eligibility guidance and community support together in one multilingual, voice-first experience.') on conflict(id) do nothing;
insert into public.events(id,organizer_id,name,event_date,venue,description,domains) values
 ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','Build for Bharat 2026','2026-11-14','Bengaluru, India','A weekend to build practical tools for communities.','{Civic tech,"AI / ML"}') on conflict(id) do nothing;
