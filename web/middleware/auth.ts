
export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log(" 🔑 Executing auth middleware.")

  const { user } = useAppStore()

  if (!user && to.path !== `/review/${demoCandidateId}`) {
    console.log(" 🔑 No user present; redirecting to login.")

    return { name: 'login', query: {redirect: to.fullPath}}
  }
})
