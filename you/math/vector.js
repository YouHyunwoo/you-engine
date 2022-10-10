Array.prototype.add = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) { throw Error() }
        return this.map((value, index) => value + other[index]);
    }
    else {
        return this.map(value => value + other);
    }
};

Array.prototype.sub = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) { throw Error() }
        return this.map((value, index) => value - other[index]);
    }
    else {
        return this.map(value => value - other);
    }
};

Array.prototype.mul = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) { throw Error() }
        return this.map((value, index) => value * other[index]);
    }
    else {
        return this.map(value => value * other);
    }
};

Array.prototype.div = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) { throw Error() }
        return this.map((value, index) => value / other[index]);
    }
    else {
        return this.map(value => value / other);
    }
};

Array.prototype.contains = function (point) {
    if (this.length === 4) {
        if (point.length === 2) {
            return this[0] <= point[0] && point[0] < this[0] + this[2] &&
                this[1] <= point[1] && point[1] < this[1] + this[3];
        }
    }

    throw Error();
};

Array.prototype.intersects = function (area) {
    if (this.length === 4) {
        if (area.length === 4) {
            return this[0] < area[0] + area[2] && area[0] < this[0] + this[2] &&
                this[1] < area[1] + area[3] && area[1] < this[1] + this[3];
        }
    }

    throw Error();
};

Array.prototype.equals = function (other) {
    if (this.length !== other.length) { throw Error() }
    return this.every((v, i) => v === other[i]);
}

Array.prototype.dot = function (other) {
    if (this.length !== other.length) { throw Error() }
    return this.reduce((acc, cur, idx) => acc + cur * other[idx], 0);
}

Object.defineProperty(Array.prototype, 'negate', {
    get() {
        return this.mul(-1);
    }
});

Object.defineProperty(Array.prototype, 'magnitude', {
    get() {
        return Math.sqrt(this.dot(this));
    }
});

Object.defineProperty(Array.prototype, 'normalized', {
    get() {
        return this.div(this.magnitude);
    }
});