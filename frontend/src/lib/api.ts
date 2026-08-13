const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// --- Forms ---
export async function fetchForms() {
  const res = await fetch(`${API_BASE_URL}/forms?_t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch forms")
  return res.json()
}

export async function fetchForm(formId: string) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch form")
  return res.json()
}

export async function createForm(title: string) {
  const res = await fetch(`${API_BASE_URL}/forms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error("Failed to create form")
  return res.json()
}

export async function deleteForm(formId: string) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete form")
  return true
}

export async function updateFormStatus(formId: string, status: "draft" | "published") {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("Failed to update form status")
  return res.json()
}

export async function updateFormTitle(formId: string, title: string) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error("Failed to update form title")
  return res.json()
}

export async function updateFormTheme(formId: string, theme: any) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme }),
  })
  if (!res.ok) throw new Error("Failed to update form theme")
  return res.json()
}

export async function duplicateFormApi(formId: string) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/duplicate`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Failed to duplicate form")
  return res.json()
}

// --- Questions ---
export async function fetchQuestions(formId: string) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/questions`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch questions")
  return res.json()
}

export async function createQuestion(formId: string, question: any) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question),
  })
  if (!res.ok) throw new Error("Failed to create question")
  return res.json()
}

export async function updateQuestion(questionId: string, question: any) {
  const res = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question),
  })
  if (!res.ok) throw new Error("Failed to update question")
  return res.json()
}

export async function deleteQuestion(questionId: string) {
  const res = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete question")
  return true
}

export async function reorderQuestions(formId: string, questionIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/questions/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_ids: questionIds }),
  })
  if (!res.ok) throw new Error("Failed to reorder questions")
  return res.json()
}

// --- Logic Rules ---
export async function createLogicRule(questionId: string, rule: any) {
  const res = await fetch(`${API_BASE_URL}/questions/${questionId}/logic_rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule),
  })
  if (!res.ok) throw new Error("Failed to create logic rule")
  return res.json()
}

export async function deleteLogicRule(ruleId: string) {
  const res = await fetch(`${API_BASE_URL}/logic_rules/${ruleId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete logic rule")
  return true
}

export async function updateLogicRule(ruleId: string, rule: any) {
  const res = await fetch(`${API_BASE_URL}/logic_rules/${ruleId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule),
  })
  if (!res.ok) throw new Error("Failed to update logic rule")
  return res.json()
}

// --- Respondent Flow ---
export async function fetchFormBySlug(slug: string) {
  const res = await fetch(`${API_BASE_URL}/forms/slug/${slug}`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch form")
  return res.json()
}

export async function submitResponse(formId: string, answers: any[]) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) throw new Error("Failed to submit response")
  return res.json()
}

export async function fetchResponses(formId: string) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/responses`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch responses")
  return res.json()
}
