import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CnpjService {
  async consultar(cnpj: string) {
    const clean = cnpj.replace(/\D/g, '');

    try {
      const response = await axios.get(`https://publica.cnpj.ws/cnpj/${clean}`);

      const data = response.data;

      return {
        empresa: {
          razao: data.razao_social,
          fantasia: data.estabelecimento.nome_fantasia || data.razao_social,
          capitalSocial: data.capital_social,
          porte: data.porte?.descricao,
          naturezaJuridica: data.natureza_juridica?.descricao,
        },
        endereco: {
          logradouro: data.estabelecimento.logradouro,
          numero: data.estabelecimento.numero,
          bairro: data.estabelecimento.bairro,
          cidade: data.estabelecimento.cidade?.nome,
          uf: data.estabelecimento.estado?.sigla,
          cep: data.estabelecimento.cep,
        },
        contato: {
          telefone: `${data.estabelecimento.ddd1 || ''}${data.estabelecimento.telefone1 || ''}`,
          email: data.estabelecimento.email,
        },
        atividadePrincipal: {
          codigo: data.estabelecimento.atividade_principal?.id,
          descricao: data.estabelecimento.atividade_principal?.descricao,
        },
        socios: data.socios?.map((s) => ({
          nome: s.nome,
          qualificacao: s.qualificacao_socio?.descricao,
        })),
      };
    } catch (error) {
      throw new BadRequestException('Erro ao consultar CNPJ');
    }
  }
}
