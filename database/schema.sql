CREATE TABLE IF NOT EXISTS estado (
  estado_codigo VARCHAR(2) PRIMARY KEY,
  estado_descricao VARCHAR(100) NOT NULL
);

INSERT INTO estado (estado_codigo, estado_descricao) VALUES
  ('AC', 'Acre'),
  ('AL', 'Alagoas'),
  ('AP', 'Amapa'),
  ('AM', 'Amazonas'),
  ('BA', 'Bahia'),
  ('CE', 'Ceara'),
  ('DF', 'Distrito Federal'),
  ('ES', 'Espirito Santo'),
  ('GO', 'Goias'),
  ('MA', 'Maranhao'),
  ('MT', 'Mato Grosso'),
  ('MS', 'Mato Grosso do Sul'),
  ('MG', 'Minas Gerais'),
  ('PA', 'Para'),
  ('PB', 'Paraiba'),
  ('PR', 'Parana'),
  ('PE', 'Pernambuco'),
  ('PI', 'Piaui'),
  ('RJ', 'Rio de Janeiro'),
  ('RN', 'Rio Grande do Norte'),
  ('RS', 'Rio Grande do Sul'),
  ('RO', 'Rondonia'),
  ('RR', 'Roraima'),
  ('SC', 'Santa Catarina'),
  ('SP', 'Sao Paulo'),
  ('SE', 'Sergipe'),
  ('TO', 'Tocantins'),
  ('EX', 'Exterior')
ON CONFLICT (estado_codigo) DO NOTHING;

CREATE TABLE IF NOT EXISTS cidade (
  cidade_id SERIAL PRIMARY KEY,
  cidade_descricao VARCHAR(150) NOT NULL,
  cidade_ibge VARCHAR(10),
  ativo BOOLEAN DEFAULT TRUE,
  dtcadastro TIMESTAMP DEFAULT NOW(),
  dtalteracao TIMESTAMP,
  dtbloqueio TIMESTAMP,
  motivobloqueio VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bairro (
  bairro_id SERIAL PRIMARY KEY,
  bairro_descricao VARCHAR(150) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  dtcadastro TIMESTAMP DEFAULT NOW(),
  dtalteracao TIMESTAMP,
  dtbloqueio TIMESTAMP,
  motivobloqueio VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS sequencial (
  sequencial_id SERIAL PRIMARY KEY,
  sequencial_tabela VARCHAR(100) NOT NULL UNIQUE,
  sequencial_valor BIGINT NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  dtcadastro TIMESTAMP DEFAULT NOW(),
  dtalteracao TIMESTAMP,
  dtbloqueio TIMESTAMP,
  motivobloqueio VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pessoa (
  pessoa_id SERIAL PRIMARY KEY,
  pessoa_tipo CHAR(1) NOT NULL,
  pessoa_cnpjcpf VARCHAR(20),
  pessoa_passaport VARCHAR(50),
  pessoa_razao VARCHAR(200),
  pessoa_fantasia VARCHAR(200),
  pessoa_cliente CHAR(1) DEFAULT 'N',
  pessoa_repres CHAR(1) DEFAULT 'N',
  pessoa_fornecedor CHAR(1) DEFAULT 'N',
  pessoa_transportadora CHAR(1) DEFAULT 'N',
  pessoa_ie VARCHAR(30),
  pessoa_email VARCHAR(200),
  pessoa_telefone VARCHAR(20),
  pessoa_celular VARCHAR(20),
  pessoa_clientregid INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  dtcadastro TIMESTAMP DEFAULT NOW(),
  dtalteracao TIMESTAMP,
  dtbloqueio TIMESTAMP,
  motivobloqueio VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS endereco (
  endereco_id SERIAL PRIMARY KEY,
  endereco_pessoaid INTEGER NOT NULL,
  endereco_cep VARCHAR(10),
  endereco_tipologradouro VARCHAR(50),
  endereco_logradouro VARCHAR(200),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(200),
  endereco_bairroid INTEGER,
  endereco_cidadeid INTEGER,
  endereco_uf VARCHAR(2),
  endereco_estadocodigo VARCHAR(2),
  endereco_faturamento CHAR(1) DEFAULT 'S',
  endereco_cobranca CHAR(1) DEFAULT 'S',
  endereco_entrega CHAR(1) DEFAULT 'S',
  endereco_observacao VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  dtcadastro TIMESTAMP DEFAULT NOW(),
  dtalteracao TIMESTAMP,
  dtbloqueio TIMESTAMP,
  motivobloqueio VARCHAR(255),
  CONSTRAINT fk_endereco_pessoa
    FOREIGN KEY (endereco_pessoaid)
    REFERENCES pessoa (pessoa_id)
);

CREATE TABLE IF NOT EXISTS contato (
  contato_id SERIAL PRIMARY KEY,
  contato_pessoaid INTEGER NOT NULL,
  contato_nome VARCHAR(150),
  contato_email VARCHAR(200),
  contato_telefone VARCHAR(20),
  contato_celular VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  dtcadastro TIMESTAMP DEFAULT NOW(),
  dtalteracao TIMESTAMP,
  dtbloqueio TIMESTAMP,
  motivobloqueio VARCHAR(255),
  CONSTRAINT fk_contato_pessoa
    FOREIGN KEY (contato_pessoaid)
    REFERENCES pessoa (pessoa_id)
);

CREATE TABLE IF NOT EXISTS usuario (
  usuario_id BIGSERIAL PRIMARY KEY,
  usuario_login VARCHAR(100) UNIQUE,
  usuario_nome VARCHAR(200),
  usuario_email VARCHAR(150),
  usuario_senha VARCHAR(200),
  usuario_ativo CHAR(1),
  usuario_dtcadastro DATE DEFAULT CURRENT_DATE,
  usuario_dtalteracao DATE,
  usuario_dtbloqueio DATE,
  usuario_motivobloqueio VARCHAR(200)
);
