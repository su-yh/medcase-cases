import { afterEach, describe, expect, it, vi } from 'vitest'
import { startCountdown } from '@/utils/countdown'
import { isPasswordConfirmed } from '@/utils/register'

describe('register utils', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects a confirmation password that differs from the password', () => {
    expect(isPasswordConfirmed('doctor-password', 'different-password')).toBe(false)
  })

  it('counts down every second and completes once at zero', () => {
    vi.useFakeTimers()
    const values = []
    const onComplete = vi.fn()

    startCountdown(3, (remainingSeconds) => values.push(remainingSeconds), onComplete)

    expect(values).toEqual([3])

    vi.advanceTimersByTime(2_000)
    expect(values).toEqual([3, 2, 1])
    expect(onComplete).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1_000)
    expect(values).toEqual([3, 2, 1, 0])
    expect(onComplete).toHaveBeenCalledOnce()

    vi.advanceTimersByTime(3_000)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('stops the countdown before it completes', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()

    const stop = startCountdown(3, () => {}, onComplete)
    stop()
    vi.advanceTimersByTime(3_000)

    expect(onComplete).not.toHaveBeenCalled()
  })
})
