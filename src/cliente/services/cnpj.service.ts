import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

interface CnpjApiResponse {
  razao_social?: string;
  capital_social?: string;
  porte?: { descricao?: string };
  natureza_juridica?: { descricao?: string };
  estabelecimento?: {
    nome_fantasia?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: { nome?: string };
    estado?: { sigla?: string };
    cep?: string;
    ddd1?: string;
    telefone1?: string;
    email?: string;
    atividade_principal?: {
      id?: string | number;
      descricao?: string;
    };
  };
  socios?: Array<{
    nome?: string;
    qualificacao_socio?: { descricao?: string };
  }>;
}

@Injectable()
export class CnpjService {
  async consultar(cnpj: string) {
    const clean = cnpj.replace(/\D/g, '');

    try {
      const response = await axios.get<CnpjApiResponse>(
        `https://publica.cnpj.ws/cnpj/${clean}`,
      );

      const data = response.data;
      const estabelecimento = data.estabelecimento;

      return {
        empresa: {
          razao: data.razao_social,
          fantasia: estabelecimento?.nome_fantasia || data.razao_social,
          capitalSocial: data.capital_social,
          porte: data.porte?.descricao,
          naturezaJuridica: data.natureza_juridica?.descricao,
        },
        endereco: {
          logradouro: estabelecimento?.logradouro,
          numero: estabelecimento?.numero,
          bairro: estabelecimento?.bairro,
          cidade: estabelecimento?.cidade?.nome,
          uf: estabelecimento?.estado?.sigla,
          cep: estabelecimento?.cep,
        },
        contato: {
          telefone: `${estabelecimento?.ddd1 || ''}${estabelecimento?.telefone1 || ''}`,
          email: estabelecimento?.email,
        },
        atividadePrincipal: {
          codigo: estabelecimento?.atividade_principal?.id,
          descricao: estabelecimento?.atividade_principal?.descricao,
        },
        socios: data.socios?.map((s) => ({
          nome: s.nome,
          qualificacao: s.qualificacao_socio?.descricao,
        })),
      };
    } catch {
      throw new BadRequestException('Erro ao consultar CNPJ');
    }
  }
}
