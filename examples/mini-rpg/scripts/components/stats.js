import { Component } from '../../../../you/component.js'
import { EventEmitter } from '../../../../you/utilities/event.js'

export class Stats extends Component {
  constructor({
    maxHp = 100,
    hp = null,
    attack = 10,
    defense = 5,
    level = 1,
    exp = 0
  } = {}) {
    super()
    this.maxHp = maxHp
    this._hp = hp ?? maxHp
    this.attack = attack
    this.defense = defense
    this.level = level
    this.exp = exp
    this.event = new EventEmitter(this)
  }

  get hp() { return this._hp }

  set hp(value) {
    const prev = this._hp
    this._hp = Math.max(0, Math.min(this.maxHp, value))
    if (this._hp !== prev) {
      this.event.emit('hpChange', this._hp, prev)
    }
    if (this._hp <= 0 && prev > 0) {
      this.event.emit('death')
    }
  }

  get alive() { return this._hp > 0 }

  takeDamage(amount, attacker = null) {
    const damage = Math.max(1, amount - this.defense)
    this.hp -= damage
    this.event.emit('damage', damage, attacker)
    return damage
  }

  heal(amount) {
    const healed = Math.min(amount, this.maxHp - this._hp)
    this.hp += healed
    this.event.emit('heal', healed)
    return healed
  }

  addExp(amount) {
    this.exp += amount
    const expToLevel = this.level * 100
    if (this.exp >= expToLevel) {
      this.exp -= expToLevel
      this.levelUp()
    }
  }

  levelUp() {
    this.level++
    this.maxHp += 10
    this.attack += 2
    this.defense += 1
    this.hp = this.maxHp
    this.event.emit('levelUp', this.level)
  }
}
