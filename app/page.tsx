import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect base URL to login page
  redirect('/login')
}
