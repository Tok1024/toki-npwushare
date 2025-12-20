export const isCoursePath = (pathname: string): boolean => {
  return /^\/course\/[^/]+\/[^/]+/.test(pathname)
}

export const isDepartmentPath = (pathname: string): boolean => {
  return /^\/department\/[^/]+/.test(pathname)
}

export const isUserPath = (pathname: string): boolean => {
  return /^\/user\/\d+/.test(pathname)
}

export const isDocPath = (pathname: string): boolean => {
  return /^\/doc\/.*/.test(pathname)
}
