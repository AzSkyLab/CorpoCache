{{/*
Common name
*/}}
{{- define "corpocache.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fullname
*/}}
{{- define "corpocache.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "corpocache.labels" -}}
helm.sh/chart: {{ include "corpocache.name" . }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "corpocache.frontend.labels" -}}
{{ include "corpocache.labels" . }}
app.kubernetes.io/name: {{ include "corpocache.name" . }}-frontend
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "corpocache.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "corpocache.name" . }}-frontend
app.kubernetes.io/component: frontend
{{- end }}

{{/*
API labels
*/}}
{{- define "corpocache.api.labels" -}}
{{ include "corpocache.labels" . }}
app.kubernetes.io/name: {{ include "corpocache.name" . }}-api
app.kubernetes.io/component: api
{{- end }}

{{/*
API selector labels
*/}}
{{- define "corpocache.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "corpocache.name" . }}-api
app.kubernetes.io/component: api
{{- end }}
