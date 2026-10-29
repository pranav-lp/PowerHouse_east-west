-- DocPass schema. Public discovery uses restricted views; private details require an active grant.
create extension if not exists pgcrypto;
create type public.user_role as enum ('student','organizer');
create type public.org_type as enum ('hackathon_organizer','recruiter','college');
create type public.media_kind as enum ('photo','certificate');
create type public.member_status as enum ('invited','active');
create type public.target_type as enum ('student','team');
create type public.access_scope as enum ('all','hackathon','project');
create type public.request_status as enum ('pending','approved','denied','revoked');
create type public.invite_status as enum ('pending','accepted','declined');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role public.user_role not null,
 full_name text not null,
 email text not null,
 region text not null default '',
 photo_path text,
 onboarded boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.student_details (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 college text not null, usn text not null,
 aadhaar_enc text, aadhaar_last4 char(4), bio text not null default ''
);
create table public.organizer_details (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 org_name text not null, org_type public.org_type not null, designation text not null,
 work_email text not null, website text
);
create table public.hackathons (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade,
 name text not null, organizer_name text not null, location text not null, event_date date not null,
 summary_line text not null check (char_length(summary_line)<=140), description text not null,
 github_url text, result text, tags text[] not null check (cardinality(tags)>0), created_at timestamptz not null default now()
);
create table public.hackathon_media (
 id uuid primary key default gen_random_uuid(), hackathon_id uuid not null references public.hackathons(id) on delete cascade,
 kind public.media_kind not null, storage_path text not null
);
create table public.teams (id uuid primary key default gen_random_uuid(), name text not null, created_by uuid not null references public.profiles(id), created_at timestamptz not null default now());
create table public.team_members (
 team_id uuid not null references public.teams(id) on delete cascade, student_id uuid not null references public.profiles(id) on delete cascade,
 status public.member_status not null default 'invited', invited_email text,
 primary key(team_id,student_id)
);
create table public.team_projects (
 id uuid primary key default gen_random_uuid(), team_id uuid not null references public.teams(id) on delete cascade,
 title text not null, summary_line text not null check(char_length(summary_line)<=140), description text not null
);
create table public.access_requests (
 id uuid primary key default gen_random_uuid(), organizer_id uuid not null references public.profiles(id) on delete cascade,
 target_type public.target_type not null, student_id uuid references public.profiles(id) on delete cascade,
 team_id uuid references public.teams(id) on delete cascade, scope public.access_scope not null,
 scope_id uuid, message text, status public.request_status not null default 'pending',
 decided_by uuid references public.profiles(id), decided_at timestamptz, expires_at timestamptz,
 created_at timestamptz not null default now(),
 check ((target_type='student' and student_id is not null and team_id is null) or (target_type='team' and team_id is not null and student_id is null)),
 check ((scope='all' and scope_id is null) or (scope<>'all' and scope_id is not null)),
 check (status<>'approved' or expires_at is not null)
);
create table public.access_logs (
 id bigint generated always as identity primary key, request_id uuid not null references public.access_requests(id),
 organizer_id uuid not null references public.profiles(id), resource text not null, viewed_at timestamptz not null default now()
);
create table public.events (
 id uuid primary key default gen_random_uuid(), organizer_id uuid not null references public.profiles(id) on delete cascade,
 name text not null, event_date date not null, venue text not null, description text not null, domains text[] not null default '{}'
);
create table public.invites (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
 target_type public.target_type not null, student_id uuid references public.profiles(id) on delete cascade,
 team_id uuid references public.teams(id) on delete cascade, status public.invite_status not null default 'pending', created_at timestamptz not null default now(),
 check ((target_type='student' and student_id is not null and team_id is null) or (target_type='team' and team_id is not null and student_id is null))
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 type text not null, payload jsonb not null default '{}', read boolean not null default false, created_at timestamptz not null default now()
);

create index access_requests_student_idx on public.access_requests(student_id,status,expires_at);
create index access_requests_team_idx on public.access_requests(team_id,status,expires_at);
create index hackathons_student_idx on public.hackathons(student_id);
create index notifications_user_idx on public.notifications(user_id,created_at desc);

create function public.is_team_member(team uuid, user_id uuid default auth.uid()) returns boolean
 language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.team_members m where m.team_id=team and m.student_id=user_id and m.status='active')
$$;
create function public.has_student_access(target uuid, resource_scope public.access_scope default 'all', resource_id uuid default null)
 returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.access_requests r where r.organizer_id=auth.uid() and r.student_id=target
   and r.target_type='student' and r.status='approved' and (r.expires_at is null or r.expires_at>now())
   and (r.scope='all' or (r.scope=resource_scope and r.scope_id=resource_id)))
$$;
create function public.has_team_access(target uuid, resource_scope public.access_scope default 'all', resource_id uuid default null)
 returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.access_requests r where r.organizer_id=auth.uid() and r.team_id=target
   and r.target_type='team' and r.status='approved' and (r.expires_at is null or r.expires_at>now())
   and (r.scope='all' or (r.scope=resource_scope and r.scope_id=resource_id)))
$$;

alter table public.profiles enable row level security;
alter table public.student_details enable row level security;
alter table public.organizer_details enable row level security;
alter table public.hackathons enable row level security;
alter table public.hackathon_media enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_projects enable row level security;
alter table public.access_requests enable row level security;
alter table public.access_logs enable row level security;
alter table public.events enable row level security;
alter table public.invites enable row level security;
alter table public.notifications enable row level security;

-- User-owned profile/detail rows are only editable by their owner. Discovery is through public views.
create policy profiles_owner on public.profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy student_details_owner on public.student_details for all using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy organizer_details_owner on public.organizer_details for all using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy hackathons_owner on public.hackathons for all using(student_id=auth.uid()) with check(student_id=auth.uid());
create policy hackathons_granted_select on public.hackathons for select using(public.has_student_access(student_id,'hackathon',id));
create policy media_owner on public.hackathon_media for all using(exists(select 1 from public.hackathons h where h.id=hackathon_id and h.student_id=auth.uid())) with check(exists(select 1 from public.hackathons h where h.id=hackathon_id and h.student_id=auth.uid()));
create policy media_granted_select on public.hackathon_media for select using(exists(select 1 from public.hackathons h where h.id=hackathon_id and public.has_student_access(h.student_id,'hackathon',h.id)));
create policy teams_member on public.teams for all using(public.is_team_member(id) or created_by=auth.uid()) with check(public.is_team_member(id) or created_by=auth.uid());
create policy team_members_owner_or_member on public.team_members for all using(student_id=auth.uid() or public.is_team_member(team_id)) with check(student_id=auth.uid() or public.is_team_member(team_id));
create policy team_projects_member on public.team_projects for all using(public.is_team_member(team_id)) with check(public.is_team_member(team_id));
create policy team_projects_granted_select on public.team_projects for select using(public.has_team_access(team_id,'project',id));
create policy access_request_participant_read on public.access_requests for select using(organizer_id=auth.uid() or student_id=auth.uid() or (team_id is not null and public.is_team_member(team_id)));
create policy access_request_organizer_insert on public.access_requests for insert with check(organizer_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='organizer'));
-- Decisions and revocations go through SECURITY DEFINER RPCs; direct UPDATE is intentionally absent.
create policy logs_participant_read on public.access_logs for select using(organizer_id=auth.uid() or exists(select 1 from public.access_requests r where r.id=request_id and (r.student_id=auth.uid() or (r.team_id is not null and public.is_team_member(r.team_id)))));
create policy events_organizer_write on public.events for all using(organizer_id=auth.uid()) with check(organizer_id=auth.uid());
create policy events_public_read on public.events for select using(true);
create policy invites_participant_read on public.invites for select using(student_id=auth.uid() or (team_id is not null and public.is_team_member(team_id)) or exists(select 1 from public.events e where e.id=event_id and e.organizer_id=auth.uid()));
create policy invites_organizer_insert on public.invites for insert with check(exists(select 1 from public.events e where e.id=event_id and e.organizer_id=auth.uid()));
create policy invites_target_update on public.invites for update using(student_id=auth.uid() or (team_id is not null and public.is_team_member(team_id))) with check(student_id=auth.uid() or (team_id is not null and public.is_team_member(team_id)));
create policy notifications_owner on public.notifications for all using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Keep discovery surfaces limited to intentionally public fields.
create view public.student_public as
 select p.id,p.full_name,p.region,p.photo_path,s.college,s.bio,
   coalesce(array_agg(distinct t.tag) filter(where t.tag is not null),'{}') as tags
 from public.profiles p join public.student_details s on s.profile_id=p.id
 left join public.hackathons h on h.student_id=p.id left join lateral unnest(h.tags) t(tag) on true
 where p.role='student' and p.onboarded group by p.id,s.college,s.bio;
create view public.hackathon_public as
 select id,student_id,name,organizer_name,location,event_date,summary_line,tags,created_at from public.hackathons;
create view public.team_public as
 select t.id,t.name,coalesce(array_agg(p.full_name) filter(where m.status='active'),'{}') as member_names,
   coalesce(jsonb_agg(jsonb_build_object('id',pr.id,'title',pr.title,'summary_line',pr.summary_line)) filter(where pr.id is not null),'[]') as projects
 from public.teams t join public.team_members m on m.team_id=t.id and m.status='active' join public.profiles p on p.id=m.student_id
 left join public.team_projects pr on pr.team_id=t.id group by t.id;
grant select on public.student_public,public.hackathon_public,public.team_public to authenticated;
grant select on public.access_requests,public.access_logs,public.notifications,public.events,public.invites to authenticated;
grant insert,update on public.profiles,public.student_details,public.organizer_details,public.hackathons,public.hackathon_media,public.teams,public.team_members,public.team_projects to authenticated;
grant insert,update,delete on public.events to authenticated;
grant insert on public.invites to authenticated;
revoke update,delete on public.access_requests from authenticated;
revoke insert,update,delete on public.access_logs from authenticated;
grant update(read) on public.notifications to authenticated;
grant update(status) on public.invites to authenticated;
-- Restrict student detail columns: Aadhaar ciphertext is never available to organizer sessions.
revoke all on public.student_details from anon,authenticated;
grant select(profile_id,college,bio) on public.student_details to authenticated;
grant insert,update(profile_id,college,usn,aadhaar_enc,aadhaar_last4,bio) on public.student_details to authenticated;
-- USN and Aadhaar are deliberately available only through SECURITY DEFINER RPCs after approval.

create or replace function public.request_access(target_type public.target_type, target_student uuid default null, target_team uuid default null,
 scope public.access_scope default 'all', scope_id uuid default null, message text default null)
 returns uuid language plpgsql security definer set search_path=public as $$ declare req uuid; target_user uuid;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='organizer') then raise exception 'organizer_only'; end if;
 if target_type='student' and target_student is not null and exists(select 1 from public.profiles where id=target_student and role='student') then target_user:=target_student;
 elsif target_type='team' and target_team is not null then select created_by into target_user from public.teams where id=target_team;
 else raise exception 'invalid_target'; end if;
 if scope='hackathon' and not exists(select 1 from public.hackathons where id=scope_id and student_id=target_student) then raise exception 'invalid_scope'; end if;
 if scope='project' and not exists(select 1 from public.team_projects where id=scope_id and team_id=target_team) then raise exception 'invalid_scope'; end if;
 insert into public.access_requests(organizer_id,target_type,student_id,team_id,scope,scope_id,message)
 values(auth.uid(),target_type,target_student,target_team,scope,scope_id,message) returning id into req;
 if target_type='team' then
  insert into public.notifications(user_id,type,payload) select m.student_id,'access_request',jsonb_build_object('request_id',req,'organizer_id',auth.uid(),'scope',scope)
   from public.team_members m where m.team_id=target_team and m.status='active';
 else
  insert into public.notifications(user_id,type,payload) values(target_user,'access_request',jsonb_build_object('request_id',req,'organizer_id',auth.uid(),'scope',scope));
 end if;
 return req;
end $$;
create or replace function public.decide_request(request_id uuid, approve boolean, expiry interval default interval '7 days')
 returns void language plpgsql security definer set search_path=public as $$ declare r public.access_requests;
begin
 select * into r from public.access_requests where id=request_id for update;
 if not found or not (r.student_id=auth.uid() or (r.team_id is not null and public.is_team_member(r.team_id))) then raise exception 'not_authorized'; end if;
 if approve and expiry is not null and expiry not in (interval '24 hours',interval '7 days',interval '30 days') then raise exception 'invalid_expiry'; end if;
 update public.access_requests set status=case when approve then 'approved'::public.request_status else 'denied'::public.request_status end,
  decided_by=auth.uid(),decided_at=now(),expires_at=case when approve and expiry is not null then now()+expiry else null end where id=request_id;
 insert into public.notifications(user_id,type,payload) values(r.organizer_id,'access_decision',jsonb_build_object('request_id',request_id,'approved',approve));
end $$;
create or replace function public.revoke_request(request_id uuid) returns void language plpgsql security definer set search_path=public as $$ declare r public.access_requests;
begin select * into r from public.access_requests where id=request_id for update;
 if not found or not (r.student_id=auth.uid() or (r.team_id is not null and public.is_team_member(r.team_id))) then raise exception 'not_authorized'; end if;
 update public.access_requests set status='revoked',decided_by=auth.uid(),decided_at=now(),expires_at=now() where id=request_id;
 insert into public.notifications(user_id,type,payload) values(r.organizer_id,'access_revoked',jsonb_build_object('request_id',request_id)); end $$;
create or replace function public.get_locked_student(target uuid) returns jsonb language plpgsql security definer set search_path=public as $$ declare h jsonb;
begin if not public.has_student_access(target,'all',null) then raise exception 'access_denied'; end if;
 select jsonb_build_object('usn',s.usn,'aadhaar_last4',s.aadhaar_last4) into h from public.student_details s where s.profile_id=target;
 insert into public.access_logs(request_id,organizer_id,resource) select r.id,auth.uid(),'student:'||target::text from public.access_requests r
 where r.student_id=target and r.organizer_id=auth.uid() and r.status='approved' and (r.expires_at is null or r.expires_at>now()) order by r.created_at desc limit 1;
 return coalesce(h,'{}'::jsonb); end $$;
create or replace function public.respond_invite(invite_id uuid, accept boolean) returns void language plpgsql security definer set search_path=public as $$
begin update public.invites set status=case when accept then 'accepted'::public.invite_status else 'declined'::public.invite_status end
 where id=invite_id and (student_id=auth.uid() or (team_id is not null and public.is_team_member(team_id)));
 if not found then raise exception 'invite_not_found'; end if; end $$;
grant execute on function public.request_access(public.target_type,uuid,uuid,public.access_scope,uuid,text) to authenticated;
grant execute on function public.decide_request(uuid,boolean,interval) to authenticated;
grant execute on function public.revoke_request(uuid) to authenticated;
grant execute on function public.get_locked_student(uuid) to authenticated;
grant execute on function public.respond_invite(uuid,boolean) to authenticated;

-- Notifications are private. Realtime clients subscribe with auth.uid() filter.
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.access_requests;
