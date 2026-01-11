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

        // [boundListener, originalListener, count] 형태로 저장
        this.eventGroups[event].push([
            listener.bind(this.bindingObject),
            listener,
            count
        ]);
    }

    remove(event, listener=null) {
        if (listener === null) {
            delete this.eventGroups[event];
        }
        else if (event in this.eventGroups) {
            // 원본 리스너(index 1)로 비교
            const index = this.eventGroups[event].findIndex(l => l[1] === listener);

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
            const [boundListener, , count] = entry;

            // count가 0이면 이미 소진된 리스너이므로 실행하지 않음
            if (count === 0) { continue }

            // 리스너 실행
            boundListener?.(...args);

            // 유한 카운트인 경우 감소
            if (count > 0) {
                entry[2] -= 1;
            }
        }

        // 소진된 리스너(count === 0) 제거
        this.eventGroups[event] = listeners.filter(([, , count]) => count !== 0);
    }
}