#!/usr/bin/env bash
# Devuelve a su columna los items del tablero que quedaron en «No Status».
# Uso (Git Bash, en la raíz del repo; gh autenticado con permiso de proyectos):
#   bash docs/planificacion/tablero/reparar-estados.sh --dry-run   # muestra qué haría
#   bash docs/planificacion/tablero/reparar-estados.sh
# Regla de reparación:
#   issue o PR cerrado                       → Done
#   issue abierto del milestone del sprint actual (SPRINT_ACTUAL) → Todo
#   issue abierto de otro milestone o sin él → Backlog
# Solo toca los items sin estado: lo que ya tiene columna se respeta.
# Lo que estaba en «In Progress» antes del incidente vuelve a «Todo»: su responsable lo mueve a mano.
set -uo pipefail

DRY=0; [[ "${1:-}" == "--dry-run" ]] && DRY=1
SPRINT_ACTUAL="${SPRINT_ACTUAL:-Sprint 2}"
PROJECT_TITLE="FarmasilERP — Tablero"

REPO="${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)}"
[[ -z "$REPO" ]] && { echo "No se pudo determinar el repo. Ejecuta dentro del clon o usa REPO=owner/repo"; exit 1; }
OWNER="${REPO%%/*}"

PNUM="$(gh project list --owner "$OWNER" --format json -q ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" | head -1)"
[[ -z "$PNUM" ]] && { echo "No se encontró el proyecto «$PROJECT_TITLE»."; exit 1; }
PID="$(gh project view "$PNUM" --owner "$OWNER" --format json -q .id)"
OPTS="$(gh project field-list "$PNUM" --owner "$OWNER" --format json -q '.fields[] | select(.name=="Status") | .id as $f | .options[] | "\($f)\t\(.name)\t\(.id)"')"
SF="$(head -1 <<<"$OPTS" | cut -f1)"
opt() { awk -F'\t' -v o="$1" '$2==o{print $3; exit}' <<<"$OPTS"; }
for o in Backlog Todo Done; do [[ -z "$(opt "$o")" ]] && { echo "Falta la columna «$o» en Status. Créala en Settings > Status y vuelve a ejecutar."; exit 1; }; done

echo "Repo: $REPO · Proyecto n.º $PNUM · Sprint actual: $SPRINT_ACTUAL"

# Estado y milestone de issues y PR (número → estado, milestone)
INFO="$(gh issue list --repo "$REPO" --state all --limit 500 --json number,state,milestone -q '.[] | "I\t\(.number)\t\(.state)\t\(.milestone.title // "")"')
$(gh pr list --repo "$REPO" --state all --limit 500 --json number,state -q '.[] | "P\t\(.number)\t\(.state)\t"')"

ITEMS="$(gh project item-list "$PNUM" --owner "$OWNER" --limit 500 --format json \
  -q '.items[] | "\(.id)|\(.content.type // "")|\(.content.number // "")|\(.status // "")|\(.content.title // "")"')"

n=0
# Separador «|»: con tabulador, bash junta campos vacíos (el estado vacío) y desplaza las columnas
while IFS='|' read -r id tipo num estado titulo; do
  [[ -z "$id" || -n "$estado" || -z "$num" ]] && continue
  pref="I"; [[ "$tipo" == "PullRequest" ]] && pref="P"
  fila="$(awk -F'\t' -v p="$pref" -v n="$num" '$1==p && $2==n{print $3"\t"$4; exit}' <<<"$INFO")"
  st="${fila%%$'\t'*}"; ms="${fila#*$'\t'}"
  if [[ "$st" == "CLOSED" || "$st" == "MERGED" ]]; then dest="Done"
  elif [[ "$pref" == "P" ]]; then dest="In Progress"
  elif [[ "$ms" == "$SPRINT_ACTUAL" ]]; then dest="Todo"
  else dest="Backlog"; fi
  o="$(opt "$dest")"; [[ -z "$o" ]] && { echo "  sin columna «$dest»: #$num"; continue; }
  printf '  #%-4s %-12s %s\n' "$num" "$dest" "$titulo"
  if (( ! DRY )); then
    gh project item-edit --id "$id" --project-id "$PID" --field-id "$SF" --single-select-option-id "$o" >/dev/null \
      || echo "  ERROR al mover #$num"
  fi
  n=$((n+1))
done <<<"$ITEMS"

(( DRY )) && echo "dry-run: $n items se moverían." || echo "Listo: $n items movidos."
