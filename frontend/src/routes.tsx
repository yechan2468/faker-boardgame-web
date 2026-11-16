import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import GamePage from './App'
import type { PlayerRole } from './types/game'

interface Session {
  authenticated: boolean
  role: PlayerRole | null
  guestLoginEnabled: boolean
}

const Page = styled.main`
  display: grid; min-height: 100vh; place-items: center; padding: 1.5rem; color: #eaf3ff;
  background: radial-gradient(ellipse at 50% 20%, #203f69 0%, #122844 48%, #0b172a 100%);
`
const Card = styled.section`
  width: min(100%, 28rem); padding: 2rem; border: 1px solid #57769c; border-radius: 1rem;
  background: #102843; box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.25);
  h1 { margin: .25rem 0 .8rem; font-size: 1.6rem; }
`
const Eyebrow = styled.p`
  margin: 0; color: #9bc9ff; font-size: .75rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
`
const Description = styled.p`margin: 0 0 1.5rem; color: #bbcee2; line-height: 1.5;`
const Notice = styled.p<{ $error?: boolean; $success?: boolean }>`
  margin: 0 0 1rem; padding: .75rem; border-radius: .6rem;
  color: ${({ $error, $success }) => ($error ? '#ffd1d1' : $success ? '#b9f3d0' : '#d4e8ff')};
  background: ${({ $error, $success }) => ($error ? '#652e3a' : $success ? '#235b46' : '#1c3b5d')};
`
const Form = styled.form`
  display: grid; gap: .65rem;
  label { font-weight: 700; }
  input { width: 100%; border: 1px solid #57769c; border-radius: .55rem; padding: .7rem; color: #edf5ff; background: #0b1c31; }
  button { margin-top: .45rem; }
`
const Button = styled.button`
  border: 0; border-radius: .6rem; padding: .75rem 1rem; color: #061323; background: #9bc9ff; font-weight: 800; cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: .5; }
`
const LinkButton = styled.button`
  margin-top: 1rem; border: 0; padding: 0; color: #a8d0ff; background: transparent; cursor: pointer; text-decoration: underline;
`

async function getSession(): Promise<Session> {
  const response = await fetch('/api/auth/session', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('로그인 상태를 확인하지 못했습니다.')
  return response.json() as Promise<Session>
}
async function readMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => ({}))) as { message?: string }
  return payload.message ?? fallback
}
function useSession() { return useQuery({ queryKey: ['session'], queryFn: getSession, retry: false }) }
function Loading() { return <Page><Card><Description>로그인 상태를 확인하는 중...</Description></Card></Page> }

function GameRoute() {
  const session = useSession()
  if (session.isLoading) return <Loading />
  return session.data?.authenticated ? <GamePage /> : <Navigate to="/login" replace />
}

function LoginPage() {
  const navigate = useNavigate(); const queryClient = useQueryClient(); const session = useSession()
  const [nickname, setNickname] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (session.data?.authenticated) navigate(session.data.role === 'HOST' ? '/admin' : '/', { replace: true }) }, [navigate, session.data])
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ username: nickname, password, loginSource: 'player' }) })
      if (!response.ok) throw new Error(await readMessage(response, '입장할 수 없습니다.'))
      await queryClient.invalidateQueries({ queryKey: ['session'] }); navigate('/', { replace: true })
    } catch (reason) { setError(reason instanceof Error ? reason.message : '입장할 수 없습니다.') } finally { setSubmitting(false) }
  }
  return <Page><Card><Eyebrow>Faker Blue</Eyebrow><h1>게임 입장</h1><Description>호스트가 알려준 비밀번호와 사용할 닉네임을 입력해 주세요.</Description>{!session.data?.guestLoginEnabled && <Notice>호스트가 아직 방을 열지 않았습니다. 호스트가 먼저 로그인하고 비밀번호를 설정해야 합니다.</Notice>}{error && <Notice $error>{error}</Notice>}<Form onSubmit={submit}><label htmlFor="nickname">닉네임</label><input id="nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} autoComplete="nickname" required /><label htmlFor="guest-password">호스트 비밀번호</label><input id="guest-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><Button disabled={submitting || !session.data?.guestLoginEnabled}>{submitting ? '입장 중...' : '입장하기'}</Button></Form><LinkButton onClick={() => navigate('/admin')}>호스트 로그인</LinkButton></Card></Page>
}

function HostLogin() {
  const navigate = useNavigate(); const queryClient = useQueryClient()
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ username, password, loginSource: 'admin' }) })
      if (!response.ok) throw new Error(await readMessage(response, '로그인할 수 없습니다.'))
      await queryClient.invalidateQueries({ queryKey: ['session'] }); navigate('/admin', { replace: true })
    } catch (reason) { setError(reason instanceof Error ? reason.message : '로그인할 수 없습니다.') } finally { setSubmitting(false) }
  }
  return <Page><Card><Eyebrow>Faker Blue · Host</Eyebrow><h1>호스트 로그인</h1><Description>호스트 계정으로 로그인한 뒤 게스트 비밀번호를 설정해 주세요.</Description>{error && <Notice $error>{error}</Notice>}<Form onSubmit={submit}><label htmlFor="host-username">아이디</label><input id="host-username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /><label htmlFor="host-password">비밀번호</label><input id="host-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><Button disabled={submitting}>{submitting ? '로그인 중...' : '로그인'}</Button></Form><LinkButton onClick={() => navigate('/login')}>게스트 입장</LinkButton></Card></Page>
}

function HostSetup({ guestLoginEnabled }: { guestLoginEnabled: boolean }) {
  const navigate = useNavigate(); const queryClient = useQueryClient(); const [guestPassword, setGuestPassword] = useState(''); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null)
  async function save(event: FormEvent) {
    event.preventDefault(); setError(null); setMessage(null)
    const response = await fetch('/api/admin/guest-password', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestPassword }) })
    if (!response.ok) { setError(await readMessage(response, '비밀번호를 저장하지 못했습니다.')); return }
    setGuestPassword(''); setMessage('게스트 비밀번호를 저장했습니다.'); await queryClient.invalidateQueries({ queryKey: ['session'] })
  }
  async function logout() { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); await queryClient.invalidateQueries({ queryKey: ['session'] }); navigate('/admin', { replace: true }) }
  return <Page><Card><Eyebrow>Faker Blue · Host</Eyebrow><h1>게스트 입장 설정</h1><Description>참가자에게 공유할 비밀번호를 설정해 주세요.</Description>{message && <Notice $success>{message}</Notice>}{error && <Notice $error>{error}</Notice>}{guestLoginEnabled && <Notice>게스트가 입장할 수 있습니다. 비밀번호를 변경하면 이후 입장부터 새 비밀번호를 사용합니다.</Notice>}<Form onSubmit={save}><label htmlFor="guest-access-password">게스트 비밀번호</label><input id="guest-access-password" type="password" value={guestPassword} onChange={(event) => setGuestPassword(event.target.value)} autoComplete="new-password" required /><Button>{guestLoginEnabled ? '비밀번호 변경' : '비밀번호 설정'}</Button></Form><LinkButton onClick={logout}>호스트 로그아웃</LinkButton><br /><LinkButton onClick={() => navigate('/')}>게임 화면으로</LinkButton></Card></Page>
}

function AdminPage() {
  const session = useSession()
  if (session.isLoading) return <Loading />
  if (!session.data?.authenticated) return <HostLogin />
  return session.data.role === 'HOST' ? <HostSetup guestLoginEnabled={session.data.guestLoginEnabled} /> : <Navigate to="/" replace />
}

export default function AppRoutes() {
  return <Routes><Route path="/" element={<GameRoute />} /><Route path="/login" element={<LoginPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>
}
