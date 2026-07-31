import type { ReactNode } from "react";

type IslandBtiContainerProps = {
  children: ReactNode;
};

/** 섬BTI 인트로·검사·결과 페이지 공통 중앙 정렬 Wrapper */
export function IslandBtiContainer({ children }: IslandBtiContainerProps) {
  return <div className="ibti-container">{children}</div>;
}
