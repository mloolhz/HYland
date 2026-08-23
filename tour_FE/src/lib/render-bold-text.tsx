import type { ReactNode } from "react";

/**
 * AI가 강조하려고 넣은 **굵게** 마크다운만 <strong>으로 렌더링한다(그 외 마크다운은 다루지 않는다).
 * 타이핑 애니메이션처럼 텍스트가 한 글자씩 늘어나는 도중에도, 열린 "**" 뒤는 곧바로 굵게
 * 보이도록 상태를 유지하며 문자 단위로 훑는다. 마지막 글자가 아직 짝을 못 채운 "*" 하나뿐이면
 * (다음 틱에 "**"로 완성될 수 있는 상태) 그 글자만 한 틱 늦게 보여줘 "**" 문자가 그대로
 * 화면에 노출되는 걸 막는다.
 */
export function renderBoldText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buffer = "";
  let bold = false;
  let key = 0;

  const flush = () => {
    if (buffer === "") return;
    nodes.push(bold ? <strong key={key++}>{buffer}</strong> : buffer);
    buffer = "";
  };

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "*" && text[i + 1] === "*") {
      flush();
      bold = !bold;
      i += 1;
      continue;
    }
    if (text[i] === "*" && i === text.length - 1) {
      continue;
    }
    buffer += text[i];
  }

  flush();
  return nodes;
}
