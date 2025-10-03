export const metadata = {
  title: 'Neon Auth section',
  description: 'Authentication layout',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <main>
        {children}
      </main>
  )
}
