type FetchOptions = {
  headers?: Record<string, string>
  query?: Record<string, string | number>
  body?: Record<string, unknown>
  formData?: FormData
}

const DEFAULT_TIMEOUT = 8000
const DEFAULT_RETRIES = 1

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const kunFetchRequest = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options?: FetchOptions,
  timeout = DEFAULT_TIMEOUT,
  retries = DEFAULT_RETRIES
): Promise<T> => {
  const { headers = {}, query, body, formData } = options || {}

  const queryString = query
    ? '?' +
      Object.entries(query)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join('&')
    : ''

  let fetchAddress =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV
      : process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD

  if (!fetchAddress) {
    if (typeof window !== 'undefined') {
      fetchAddress = window.location.origin
    } else {
      fetchAddress = 'http://127.0.0.1:3000'
    }
  }

  const fullUrl = `${fetchAddress.replace(/\/$/, '')}/api${url}${queryString}`

  const hdrs: Record<string, string> = {
    ...headers
  }
  if (body && !formData) {
    hdrs['Content-Type'] = 'application/json'
  }

  const fetchOptions: RequestInit = {
    method,
    credentials: 'include',
    mode: 'cors',
    headers: hdrs as HeadersInit
  }

  if (formData) {
    fetchOptions.body = formData
    // if formData present, remove content-type so browser can set boundary
    if (hdrs['Content-Type']) {
      delete hdrs['Content-Type']
    }
  } else if (body) {
    fetchOptions.body = JSON.stringify(body)
  }

  let attempt = 0
  // Retry loop
  while (attempt <= retries) {
    attempt += 1
    const controller =
      typeof AbortController !== 'undefined' ? new AbortController() : null
    const signal = controller ? controller.signal : undefined

    if (controller) {
      fetchOptions.signal = signal
    }

    let timeoutId: NodeJS.Timeout | number | undefined
    try {
      if (controller) {
        // @ts-ignore - NodeJS/Browser timers
        timeoutId = setTimeout(() => controller.abort(), timeout)
      }

      const response = await fetch(fullUrl, fetchOptions)

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(
          `Kun Fetch error! Status: ${response.status} ${response.statusText} ${text}`
        )
      }

      // try to parse JSON safely
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const res = await response.json()
        return res
      }

      // fallback: return text as unknown
      const text = await response.text()
      // @ts-ignore
      return text
    } catch (error: any) {
      // distinguish abort vs network error
      const isAbort = error?.name === 'AbortError'
      // On last attempt, log and throw
      if (attempt > retries) {
        console.error(
          `Kun Fetch failed: url=${fullUrl} attempt=${attempt} abort=${isAbort} error=${String(error)}`
        )
        throw error
      }

      // transient network error: wait briefly then retry
      console.warn(
        `Kun Fetch retrying (${attempt}/${retries}) for ${fullUrl}: ${String(error)}`
      )
      await wait(300 * attempt)
      continue
    } finally {
      if (timeoutId) {
        try {
          clearTimeout(timeoutId as any)
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  // should never reach here
  throw new Error('Kun Fetch failed after retries')
}

export const kunFetchGet = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'GET', { query })
}

export const kunFetchPost = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'POST', { body })
}

export const kunFetchPut = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'PUT', { body })
}

export const kunFetchDelete = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'DELETE', { query })
}

export const kunFetchFormData = async <T>(
  url: string,
  formData?: FormData
): Promise<T> => {
  if (!formData) {
    throw new Error('formData is required for kunFetchFormData')
  }
  return kunFetchRequest<T>(url, 'POST', { formData })
}
