#!/usr/bin/env bash
# Crea labels, milestones, issues y el proyecto Kanban de FarmasilERP en GitHub.
# Requisitos: gh (GitHub CLI) autenticado con permiso de proyectos:
#   gh auth login
#   gh auth refresh -s project
# Uso: abrir **Git Bash** (no CMD ni PowerShell: ahí «bash» llama a WSL) en la raíz del repo y ejecutar
#   bash docs/planificacion/tablero/crear-tablero.sh [--dry-run]
# Desde CMD también sirve:  "C:\Program Files\Git\bin\bash.exe" docs/planificacion/tablero/crear-tablero.sh --dry-run
# Incluso en --dry-run se necesita gh autenticado (lee el repo y los issues existentes).
# Es re-ejecutable: no duplica labels ni milestones; los issues se omiten si ya existe uno con el mismo título.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY=0; [[ "${1:-}" == "--dry-run" ]] && DRY=1
run() { if (( DRY )); then echo "[dry-run] gh $*" >&2; return 0; else gh "$@"; fi; }

REPO="${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)}"
[[ -z "$REPO" ]] && { echo "No se pudo determinar el repo. Ejecuta dentro del clon o usa REPO=owner/repo"; exit 1; }
OWNER="${REPO%%/*}"
PROJECT_TITLE="FarmasilERP — Tablero"
echo "Repo: $REPO · Proyecto: $PROJECT_TITLE"

# ---------- 1. Labels ----------
echo "== Labels"
while IFS='|' read -r name color desc; do
  [[ -z "$name" ]] && continue
  run label create "$name" --color "$color" --description "$desc" --force --repo "$REPO" >/dev/null
done <<'EOF'
tipo:historia|0E8A16|Historia de usuario (HU)
tipo:historia-tecnica|5319E7|Historia técnica habilitadora (HT)
tipo:tarea|1D76DB|Tarea técnica de una historia
tipo:spike|FBCA04|Investigación / decisión con plazo
tipo:calidad|C2E0C6|Plan de pruebas y pruebas de aceptación (QA)
bug|D73A4A|Defecto encontrado
bloqueante|B60205|Bloquea a otros issues
must|B60205|MoSCoW: Must have
should|D93F0B|MoSCoW: Should have
could|FEF2C0|MoSCoW: Could have
mod:inventario|BFD4F2|M1 Inventario (incluye catálogo de productos)
mod:ventas|BFD4F2|M2 Ventas
mod:reportes|BFD4F2|M3 Reportes
mod:transversal|BFD4F2|Transversal / infraestructura
EOF

# ---------- 2. Milestones (= sprints) ----------
echo "== Milestones"
EXIST_MS="$(gh api "repos/$REPO/milestones?state=all&per_page=100" -q '.[].title' 2>/dev/null || true)"
while IFS=$'\t' read -r title due desc; do
  [[ -z "$title" ]] && continue
  if grep -qxF "$title" <<<"$EXIST_MS"; then echo "  ya existe: $title"; continue; fi
  run api "repos/$REPO/milestones" -f title="$title" -f due_on="${due}T23:59:59Z" -f description="$desc" >/dev/null
done < "$DIR/milestones.tsv"

# ---------- 3. Issues (pasada 1: crear) ----------
echo "== Issues"
declare -A NUM URL
EXIST="$(gh issue list --repo "$REPO" --state all --limit 500 --json number,title,url -q '.[] | "\(.number)\t\(.title)\t\(.url)"' 2>/dev/null || true)"
field() { sed -n "/^---\$/,/^---\$/p" "$1" | sed -n "s/^$2: //p" | head -1; }
body_of() { awk 'BEGIN{c=0} /^---$/{c++; next} c>=2{print}' "$1"; }

for f in "$DIR"/issues/*.md; do
  code="$(field "$f" codigo)"; title="$(field "$f" titulo)"; labels="$(field "$f" labels)"; ms="$(field "$f" milestone)"
  found="$(awk -F'\t' -v t="$title" '$2==t{print $1"\t"$3; exit}' <<<"$EXIST")"
  if [[ -n "$found" ]]; then
    NUM[$code]="${found%%$'\t'*}"; URL[$code]="${found##*$'\t'}"; echo "  omitido (ya existe #${NUM[$code]}): $title"; continue
  fi
  tmp="$(mktemp)"; body_of "$f" > "$tmp"
  args=(issue create --repo "$REPO" --title "$title" --body-file "$tmp")
  IFS=',' read -ra L <<<"$labels"; for l in "${L[@]}"; do args+=(--label "$l"); done
  [[ -n "$ms" ]] && args+=(--milestone "$ms")
  if (( DRY )); then echo "[dry-run] gh ${args[*]}" >&2; u="https://github.com/$REPO/issues/$((RANDOM))"; else u="$(gh "${args[@]}" | tail -1)"; fi
  rm -f "$tmp"
  URL[$code]="$u"; NUM[$code]="${u##*/}"; echo "  #${NUM[$code]}  $title"
done

# ---------- 4. Issues (pasada 2: resolver {{CÓDIGO}} -> #n) ----------
echo "== Enlaces entre issues"
for f in "$DIR"/issues/*.md; do
  code="$(field "$f" codigo)"; [[ -z "${NUM[$code]:-}" ]] && continue
  tmp="$(mktemp)"; body_of "$f" > "$tmp"
  grep -q '{{' "$tmp" || { rm -f "$tmp"; continue; }
  for k in "${!NUM[@]}"; do sed -i "s/{{${k//./\\.}}}/#${NUM[$k]}/g" "$tmp"; done
  run issue edit "${NUM[$code]}" --repo "$REPO" --body-file "$tmp" >/dev/null
  rm -f "$tmp"
done

# ---------- 5. Proyecto Kanban ----------
echo "== Proyecto"
PNUM="$(gh project list --owner "$OWNER" --format json -q ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" 2>/dev/null | head -1 || true)"
if [[ -z "$PNUM" ]]; then
  if (( DRY )); then PNUM=0; else PNUM="$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json -q .number)"; fi
  run project link "$PNUM" --owner "$OWNER" --repo "$REPO" >/dev/null
fi
echo "  proyecto n.º $PNUM"
(( DRY )) && { echo "dry-run terminado."; exit 0; }
PID="$(gh project view "$PNUM" --owner "$OWNER" --format json -q .id)"

mkfield() { gh project field-create "$PNUM" --owner "$OWNER" --name "$1" "${@:2}" >/dev/null 2>&1 || true; }
mkfield "Puntos" --data-type NUMBER
mkfield "Horas" --data-type NUMBER
mkfield "Sprint" --data-type SINGLE_SELECT --single-select-options "Sprint 1,Sprint 2,Sprint 3,Sprint 4,Condicional"
mkfield "Rol" --data-type SINGLE_SELECT --single-select-options "Scrum Master,QA,Back-end,Front-end,Equipo"

# Columnas del plan: Backlog → Por hacer → En progreso → En revisión → Hecho
load_fields() {
  FIDS="$(gh project field-list "$PNUM" --owner "$OWNER" --format json -q '.fields[] | "\(.name)\t\(.id)"')"
  OPTS="$(gh project field-list "$PNUM" --owner "$OWNER" --format json -q '.fields[] | .name as $f | .options[]? | "\($f)\t\(.name)\t\(.id)"')"
}
load_fields
# sin jq: gh ya trae su propio filtro (-q); aquí solo se busca en texto
fid() { awk -F'\t' -v n="$1" '$1==n{print $2; exit}' <<<"$FIDS"; }
optid() { awk -F'\t' -v n="$1" -v o="$2" '$1==n && $2==o{print $3; exit}' <<<"$OPTS"; }

STATUS_ID="$(fid Status)"
gh api graphql -f query='
mutation($f:ID!){ updateProjectV2Field(input:{fieldId:$f, singleSelectOptions:[
 {name:"Backlog",color:GRAY,description:""},{name:"Por hacer",color:BLUE,description:""},
 {name:"En progreso",color:YELLOW,description:"WIP 4"},{name:"En revisión",color:ORANGE,description:"WIP 3"},
 {name:"Hecho",color:GREEN,description:""}]}){ projectV2Field{ ... on ProjectV2SingleSelectField{ id } } } }' \
 -f f="$STATUS_ID" >/dev/null 2>&1 \
 && echo "  columnas de Status configuradas" \
 || echo "  AVISO: no se pudieron renombrar las columnas por API; hazlo a mano en Settings > Status (ver README del tablero)."
load_fields

for f in "$DIR"/issues/*.md; do
  code="$(field "$f" codigo)"; [[ -z "$code" ]] && continue; u="${URL[$code]:-}"; [[ -z "$u" ]] && continue
  pts="$(field "$f" puntos)"; spr="$(field "$f" sprint)"; est="$(field "$f" estado)"; rol="$(field "$f" rol)"
  hrs="$(grep -oE '\| Estimación \| [0-9.]+ h' "$f" | grep -oE '[0-9.]+' | head -1 || true)"
  item="$(gh project item-add "$PNUM" --owner "$OWNER" --url "$u" --format json -q .id)"
  edit() { gh project item-edit --id "$item" --project-id "$PID" "$@" >/dev/null 2>&1 || echo "  aviso: no se pudo fijar campo en $code"; }
  [[ -n "$pts" && "$pts" != "0" ]] && edit --field-id "$(fid Puntos)" --number "$pts"
  [[ -n "$hrs" ]] && edit --field-id "$(fid Horas)" --number "$hrs"
  o="$(optid Sprint "$spr")"; [[ -n "$o" ]] && edit --field-id "$(fid Sprint)" --single-select-option-id "$o"
  o="$(optid Rol "$rol")"; [[ -n "$o" ]] && edit --field-id "$(fid Rol)" --single-select-option-id "$o"
  o="$(optid Status "$est")"; [[ -n "$o" ]] && edit --field-id "$STATUS_ID" --single-select-option-id "$o"
  echo "  en tablero: $code"
done
echo "Listo. Abre: https://github.com/users/$OWNER/projects/$PNUM  (o la URL de la organización)"
