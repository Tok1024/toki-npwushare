import { prisma } from '~/prisma'

// Usage examples:
//   pnpm esno scripts/grantAdmin.ts --email alice@example.com --role 3
//   pnpm esno scripts/grantAdmin.ts --email=alice@example.com --role=3
//   pnpm esno scripts/grantAdmin.ts -e alice@example.com -r 3
// role: 1-user, 2-publisher, 3-admin, 4-super admin

function parseArgs(): Map<string, string> {
  const out = new Map<string, string>()
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token.startsWith('--')) {
      const eq = token.indexOf('=')
      if (eq > -1) {
        const k = token.slice(2, eq)
        const v = token.slice(eq + 1)
        if (k && v) out.set(k, v)
      } else {
        const k = token.slice(2)
        const v = argv[i + 1]
        if (k && v && !v.startsWith('-')) {
          out.set(k, v)
          i++
        }
      }
    } else if (token.startsWith('-')) {
      const k = token.replace(/^-+/, '')
      const v = argv[i + 1]
      if (v && !v.startsWith('-')) {
        const key = k === 'e' ? 'email' : k === 'r' ? 'role' : k
        out.set(key, v)
        i++
      }
    }
  }
  return out
}

async function main() {
  const args = parseArgs()
  const email = args.get('email')
  const roleStr = args.get('role')
  if (!email || !roleStr) {
    console.log(
      'Usage: pnpm esno scripts/grantAdmin.ts --email <email> --role <1|2|3|4>'
    )
    console.log(
      '       pnpm esno scripts/grantAdmin.ts --email=<email> --role=<1|2|3|4>'
    )
    console.log(
      '       pnpm esno scripts/grantAdmin.ts -e <email> -r <1|2|3|4>'
    )
    process.exit(1)
  }
  const role = Number(roleStr)
  if (![1, 2, 3, 4].includes(role)) {
    console.log('Invalid role, should be 1|2|3|4')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log('User not found:', email)
    process.exit(1)
  }

  await prisma.user.update({ where: { id: user.id }, data: { role } })
  console.log(`Updated ${email} -> role ${role}`)
}

main().finally(async () => {
  await prisma.$disconnect()
})
