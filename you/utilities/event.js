export class EventEmitter {

    constructor(bindingObject=null) {
        this.bindingObject = bindingObject;
        this.eventGroups = {};
    }

    on(event, listener, count=-1) {
        if (count === 0) { return }

        if (!(event in this.eventGroups)) {
            this.eventGroups[event] = [];
        }

        this.eventGroups[event].push([listener.bind(this.bindingObject), count]);
    }

    remove(event, listener=null) {
        if (listener === null) {
            delete this.eventGroups[event];
        }
        else if (event in this.eventGroups) {
            const index = this.eventGroups[event].map(l => l[0]).indexOf(listener);

            if (index >= 0) {
                this.eventGroups[event].splice(index, 1);
            }
        }
    }

    emit(event, ...args) {
        const listeners = this.eventGroups[event];
        if (!listeners) { return }

        // 리스너 실행 및 카운트 감소
        for (const entry of listeners) {
            const [listener, count] = entry;

            // count가 0이면 이미 소진된 리스너이므로 실행하지 않음
            if (count === 0) { continue }

            // 리스너 실행
            listener?.(...args);

            // 유한 카운트인 경우 감소
            if (count > 0) {
                entry[1] -= 1;
            }
        }

        // 소진된 리스너(count === 0) 제거
        this.eventGroups[event] = listeners.filter(([, count]) => count !== 0);
    }
}