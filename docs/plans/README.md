# 구현 계획 문서

구현 계획 문서를 관리하는 폴더입니다.

## 폴더 구조

```
docs/plans/
├── README.md           # 이 파일
├── archived/           # 구현 완료된 계획
├── deprecated/         # 폐기된 계획 (기획 변경 등)
└── *.md                # 진행 중 또는 대기 중인 계획
```

## 문서 상태

| 위치 | 상태 | 설명 |
|------|------|------|
| `plans/*.md` | 활성 | 구현 대기 중이거나 진행 중인 계획 |
| `plans/archived/` | 완료 | 구현이 완료되어 아카이브된 계획 |
| `plans/deprecated/` | 폐기 | 기획 변경으로 폐기된 계획 (재활용 가능) |

## 파일명 규칙

`YYYY-MM-DD-<feature-name>.md`

예: `2026-01-11-particle-system.md`
