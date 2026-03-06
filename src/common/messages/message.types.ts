export interface AppMensagem {
  codigo?: string;
  mensagem: string;
  ajuda: string;
}

export function criarMensagem(
  mensagem: string,
  ajuda = '',
  codigo?: string,
): AppMensagem {
  return { codigo, mensagem, ajuda };
}
