interface Node<T> {
  value: T;
  prev: Node<T>;
  next: Node<T>;
}

export class Dequeue<T> {
  private _length = 0;
  private head: Node<T> = undefined;
  private tail: Node<T> = undefined;

  get length() {
    return this._length;
  }

  push(value: T) {
    const newNode: Node<T> = {
      value,
      prev: this.tail,
      next: undefined,
    };

    if (this._length) {
      this.tail.next = newNode;
      this.tail = newNode;
    } else {
      this.head = this.tail = newNode;
    }
    this._length++;
  }

  shift(): T {
    if (!this._length) {
      return undefined;
    }
    const result = this.head;
    this.head = this.head.next;
    this._length--;
    if (!this._length) {
      this.head = this.tail = undefined;
    }
    return result.value;
  }

  peekFront(): T {
    if (this._length) {
      return this.head.value;
    }
    return undefined;
  }
}
