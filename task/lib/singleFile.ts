export const singleFile = <
  Args extends unknown[],
  ReturnValue extends unknown,
  Context,
>(
  callback: (...args: Args) => ReturnValue | Promise<ReturnValue>,
  context?: Context,
) => {
  let queue: Promise<ReturnValue>

  return function (this: unknown, ...args: Args) {
    const call = () => callback.apply(this === undefined ? context : this, args)

    queue = Promise.resolve(queue).then(call, call)

    return queue
  }
}
