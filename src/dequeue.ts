interface Node<T> {
  value: T;
  prev: Node<T>;
  next: Node<T>;
}

export function dequeue<T>() {
  let length = 0;
  let head: Node<T> = undefined;
  let tail: Node<T> = undefined;

  function push(value: T) {
    const newNode: Node<T> = {
      value,
      prev: tail,
      next: undefined,
    };

    if (length) {
      tail.next = newNode;
      tail = newNode;
    } else {
      head = tail = newNode;
    }
    length++;
  }

  function shift(): T {
    if (!length) {
      return undefined;
    }
    const result = head;
    head = head.next;
    length--;
    if (!length) {
      head = tail = undefined;
    }
    return result.value;
  }

  function peekFront(): T {
    if (length) {
      return head.value;
    }
    return undefined;
  }

  return {
    length: () => length,
    push,
    shift,
    peekFront,
  };
}
