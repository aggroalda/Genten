-- ============================================================
-- Genten Status — Supabase Schema
-- Ejecutar en Supabase SQL Editor (en orden)
-- ============================================================

-- Extensión pgvector para búsqueda semántica
create extension if not exists vector;

-- ============================================================
-- clientes
-- ============================================================
create table if not exists clientes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text unique not null,
  created_at timestamptz default now()
);
create index if not exists idx_clientes_telefono on clientes (telefono);

-- ============================================================
-- servicios  (catálogo + embeddings para vector search)
-- ============================================================
create table if not exists servicios (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  tipo_vehiculo text not null check (tipo_vehiculo in ('Auto','Camioneta','SUV','Moto')),
  precio      numeric(10,2) not null,
  descripcion text,
  embedding   vector(1536),
  created_at  timestamptz default now()
);
create index if not exists idx_servicios_tipo on servicios (tipo_vehiculo);
create index if not exists idx_servicios_embedding
  on servicios using hnsw (embedding vector_cosine_ops);

-- ============================================================
-- agenda
-- ============================================================
create table if not exists agenda (
  id             uuid primary key default gen_random_uuid(),
  titulo         text not null,
  fecha          date not null,
  hora_recepcion text not null,
  vehiculo       text not null,
  tipo_vehiculo  text not null check (tipo_vehiculo in ('Auto','Camioneta','SUV','Moto')),
  servicio       text not null,
  estado         text not null default 'Reservado'
                   check (estado in ('Reservado','En Progreso','Completado','Cancelado')),
  precio         numeric(10,2),
  pagado         boolean default false,
  cliente_id     uuid references clientes(id) on delete set null,
  created_at     timestamptz default now()
);
create index if not exists idx_agenda_fecha   on agenda (fecha);
create index if not exists idx_agenda_estado  on agenda (estado);
create index if not exists idx_agenda_cliente on agenda (cliente_id);

-- ============================================================
-- chat_sessions  (LangChain Postgres memory — n8n la usa directo)
-- ============================================================
create table if not exists chat_sessions (
  id         bigserial primary key,
  session_id text not null,
  message    jsonb not null,
  created_at timestamptz default now()
);
create index if not exists idx_chat_session_id on chat_sessions (session_id);

-- ============================================================
-- Función: match_servicios
-- Búsqueda semántica de servicios por tipo de vehículo
-- Llamada desde n8n Supabase Vector Store con rpc
-- ============================================================
create or replace function match_servicios(
  query_embedding vector(1536),
  filter          jsonb default '{}'
)
returns table (
  id          uuid,
  content     text,
  metadata    jsonb,
  similarity  float
)
language plpgsql as $$
begin
  return query
  select
    s.id,
    (s.nombre || ' — ' || s.tipo_vehiculo || ' — $' || s.precio::text ||
     coalesce(' — ' || s.descripcion, '')) as content,
    jsonb_build_object(
      'nombre',        s.nombre,
      'tipo_vehiculo', s.tipo_vehiculo,
      'precio',        s.precio,
      'descripcion',   s.descripcion
    ) as metadata,
    1 - (s.embedding <=> query_embedding) as similarity
  from servicios s
  where
    (filter->>'tipo_vehiculo' is null or s.tipo_vehiculo = filter->>'tipo_vehiculo')
  order by s.embedding <=> query_embedding
  limit 10;
end;
$$;

-- ============================================================
-- Función: disponibilidad_dia
-- Retorna total reservas activas y si el día está bloqueado
-- Llamada por el tool registrar_cita y reagendar_cita
-- ============================================================
create or replace function disponibilidad_dia(p_fecha date)
returns table (
  total_citas    bigint,
  dia_bloqueado  boolean
)
language sql stable as $$
  select
    count(*) as total_citas,
    bool_or(
      servicio ilike '%completo exterior e interior%'
      or (tipo_vehiculo = 'Moto' and servicio ilike '%abrillantado de pintura%')
    ) as dia_bloqueado
  from agenda
  where fecha = p_fecha
    and estado in ('Reservado','En Progreso');
$$;
