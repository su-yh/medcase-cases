export function startCountdown(seconds, onTick, onComplete) {
  let remainingSeconds = seconds
  let completed = false

  onTick(remainingSeconds)

  const timer = setInterval(() => {
    remainingSeconds -= 1
    onTick(remainingSeconds)

    if (remainingSeconds === 0) {
      clearInterval(timer)
      if (!completed) {
        completed = true
        onComplete()
      }
    }
  }, 1_000)

  return () => {
    clearInterval(timer)
  }
}
