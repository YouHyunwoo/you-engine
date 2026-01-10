import { Application } from "../../../you/application.js";

const CONFIG = {
	canvasSize: [900, 600],
	playerRadius: 18,
	playerRange: 240,
	attackCooldown: 0.38,
	beamDuration: 0.12,
	monsterSize: 28,
	monsterSpeed: [55, 95],
	spawnInterval: 1.1,
	spawnIntervalMin: 0.35,
	spawnAcceleration: 0.025,
	baseDamage: 1,
	monsterScalePerSec: 0.08,
	monsterSpeedScalePerSec: 0.06,
	monsterHpScalePerSec: 0.14,
	monsterDamageScalePerSec: 0.08,
	goldPerKill: 3,
	chestInterval: [18, 26],
	chestHp: 18,
	chestSpeed: 90,
	upgradeCost: 15,
	rerollBaseCost: 5,
	rerollCostGrowth: 5,
};

const RANGE_CAP = 400;

const MONSTER_TYPES = [
	{ id: 'grunt', hp: 3, speed: 1.0, damage: 1, color: '#f97316', weight: 4 },
	{ id: 'brute', hp: 8, speed: 0.85, damage: 2, color: '#fb923c', weight: 2 },
	{ id: 'runner', hp: 2, speed: 1.35, damage: 1, color: '#f59e0b', weight: 3 },
	{ id: 'spike', hp: 4, speed: 1.0, damage: 3, color: '#f43f5e', weight: 1 },
	{ id: 'tank', hp: 12, speed: 0.7, damage: 2, color: '#ea580c', weight: 1 },
];

const UPGRADES = [
	{ id: 'as1', label: 'Faster fire rate', apply: p => p.attackCooldown = Math.max(0.12, p.attackCooldown * 0.87) },
	{ id: 'dmg1', label: 'Damage +1', apply: p => p.damage += 1 },
	{ id: 'dmg2', label: 'Damage +2', apply: p => p.damage += 2 },
	{ id: 'range1', label: 'Range +40', condition: p => p.range < RANGE_CAP, apply: p => p.range = Math.min(RANGE_CAP, p.range + 40) },
	{ id: 'range2', label: 'Range +80', condition: p => p.range < RANGE_CAP, apply: p => p.range = Math.min(RANGE_CAP, p.range + 80) },
	{ id: 'beam', label: 'Longer beam', apply: p => p.beamDuration += 0.06 },
	{ id: 'gold', label: 'Gold +50%', apply: p => p.goldBonus = (p.goldBonus || 1) * 1.5 },
	{ id: 'slow1', label: '10% slow on hit', apply: p => { p.slowChance += 0.1; p.slowChance = Math.min(0.9, p.slowChance); } },
	{ id: 'slow2', label: 'Stronger slow', condition: p => p.slowChance > 0, apply: p => p.slowStrength = Math.min(0.9, p.slowStrength + 0.15) },
	{ id: 'slow3', label: 'Longer slow', condition: p => p.slowChance > 0, apply: p => p.slowDuration += 0.4 },
	{ id: 'multi', label: 'Double beam', apply: p => p.multishot = Math.min(3, (p.multishot || 1) + 1) },
	{ id: 'crit', label: '20% crit x2', apply: p => { p.critChance = Math.min(0.8, p.critChance + 0.2); p.critMultiplier = (p.critMultiplier || 2); } },
	{ id: 'pierce', label: 'Pierce 1 target', apply: p => p.pierce = Math.min(3, (p.pierce || 0) + 1) },
	{ id: 'burn', label: 'Bleed 1 dmg/s 3s', apply: p => p.bleed = { damage: (p.bleed?.damage || 1), duration: (p.bleed?.duration || 3) } },
	{ id: 'bomb_unlock', label: 'Unlock bombing strike', apply: p => {
		p.bombUnlocked = true;
		p.bombDamage = p.bombDamage || 6;
		p.bombRadius = p.bombRadius || 80;
		p.bombCooldown = p.bombCooldown || 5;
	}},
	{ id: 'bomb_dmg', label: 'Bomb damage +4', condition: p => p.bombUnlocked, apply: p => p.bombDamage = (p.bombDamage || 0) + 4 },
	{ id: 'bomb_radius', label: 'Bomb radius +20', condition: p => p.bombUnlocked, apply: p => p.bombRadius = (p.bombRadius || 0) + 20 },
	{ id: 'bomb_cd', label: 'Bomb cooldown -0.5s', condition: p => p.bombUnlocked && (p.bombCooldown || 0) > 0.7, apply: p => p.bombCooldown = Math.max(0.6, (p.bombCooldown || 5) - 0.5) },
];
function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}

function distance(a, b) {
	const dx = a[0] - b[0];
	const dy = a[1] - b[1];
	return Math.hypot(dx, dy);
}

function normalize(vx, vy) {
	const mag = Math.hypot(vx, vy) || 1;
	return [vx / mag, vy / mag];
}

function weightedChoice(items) {
	const total = items.reduce((acc, cur) => acc + (cur.weight || 1), 0);
	let r = Math.random() * total;
	for (const item of items) {
		r -= (item.weight || 1);
		if (r <= 0) { return item; }
	}
	return items[0];
}

function addExplosionDamage(monsters, center, radius, damage, onKill) {
	const killed = [];
	for (const monster of [...monsters]) {
		const d = distance(monster.position, center);
		if (d <= radius + monster.size * 0.5) {
			monster.hp -= damage;
			if (monster.hp <= 0) { killed.push(monster); }
		}
	}
	killed.forEach(m => { onKill(m); });
	return monsters.filter(m => !killed.includes(m));
}

function randomUpgradeFor(player) {
	const pool = UPGRADES.filter(u => !u.condition || u.condition(player));
	if (pool.length === 0) { return null; }
	return pool[Math.floor(Math.random() * pool.length)];
}

export class DefenseGame extends Application {

	constructor({ events = {}, mainScreen = null } = {}) {
		super({ events, mainScreen });

		this.player = {
			position: [0, 0],
			radius: CONFIG.playerRadius,
			range: Math.min(CONFIG.playerRange, RANGE_CAP),
			attackCooldown: CONFIG.attackCooldown,
			beamDuration: CONFIG.beamDuration,
			damage: CONFIG.baseDamage,
			timer: 0,
			slowChance: 0,
			slowStrength: 0.35,
			slowDuration: 1.2,
			critChance: 0,
			critMultiplier: 2,
			multishot: 1,
			pierce: 0,
			bleed: null,
			goldBonus: 1,
			bombUnlocked: false,
			bombDamage: 0,
			bombRadius: 0,
			bombCooldown: 0,
			bombTimer: 0,
		};

		this.gold = 0;
		this.reset(false);
	}

	reset(keepGold = true) {
		const [w, h] = CONFIG.canvasSize;
		this.player.position = [w / 2, h / 2];
		this.player.timer = 0;
		this.player.range = Math.min(this.player.range, RANGE_CAP);
		if (this.player.bombUnlocked && !this.player.bombCooldown) { this.player.bombCooldown = 5; }
		if (this.player.bombUnlocked && !this.player.bombDamage) { this.player.bombDamage = 6; }
		if (this.player.bombUnlocked && !this.player.bombRadius) { this.player.bombRadius = 80; }
		this.player.bombTimer = this.player.bombCooldown || 0;

		this.monsters = [];
		this.chests = [];
		this.beams = [];
		this.effects = [];
		this.spawnTimer = 0;
		this.spawnInterval = CONFIG.spawnInterval;
		this.score = 0;
		this.gold = keepGold ? (this.gold ?? 0) : 0;
		this.gameOver = false;
		this.timeAlive = 0;
		this.showShop = false;
		this.offers = [];
		this.rerollCost = CONFIG.rerollBaseCost;
		this.chestTimer = 0;
		this.nextChestTime = randomRange(CONFIG.chestInterval[0], CONFIG.chestInterval[1]);
		this.rewardNote = null;
	}

	didCreate() {
		this.reset(false);
	}

	spawnMonster() {
		const [w, h] = this.screen.size || CONFIG.canvasSize;
		const margin = CONFIG.monsterSize;
		const side = Math.floor(Math.random() * 4);

		let x = 0, y = 0;
		if (side === 0) { x = -margin; y = randomRange(0, h); }
		else if (side === 1) { x = w + margin; y = randomRange(0, h); }
		else if (side === 2) { x = randomRange(0, w); y = -margin; }
		else { x = randomRange(0, w); y = h + margin; }

		const [dx, dy] = [this.player.position[0] - x, this.player.position[1] - y];
		const [nx, ny] = normalize(dx, dy);

		const type = weightedChoice(MONSTER_TYPES);
		const scale = 1 + this.timeAlive * CONFIG.monsterScalePerSec;
		const speedScale = 1 + this.timeAlive * CONFIG.monsterSpeedScalePerSec;
		const hpScale = 1 + this.timeAlive * CONFIG.monsterHpScalePerSec;
		const dmgScale = 1 + this.timeAlive * CONFIG.monsterDamageScalePerSec;
		const baseSpeed = randomRange(CONFIG.monsterSpeed[0], CONFIG.monsterSpeed[1]);

		const monster = {
			position: [x, y],
			velocity: [nx * baseSpeed * type.speed * speedScale, ny * baseSpeed * type.speed * speedScale],
			size: CONFIG.monsterSize,
			type: type.id,
			hp: Math.max(1, type.hp * hpScale * scale),
			maxHp: Math.max(1, type.hp * hpScale * scale),
			damage: type.damage * dmgScale,
			color: type.color,
			slowTimer: 0,
			slowFactor: 1,
			bleedTimer: 0,
			bleedDamage: 0,
		};

		this.monsters.push(monster);
	}

	spawnChest() {
		const [w, h] = this.screen.size || CONFIG.canvasSize;
		const y = randomRange(h * 0.2, h * 0.8);
		const fromLeft = Math.random() < 0.5;
		const margin = CONFIG.monsterSize;
		const x = fromLeft ? -margin : w + margin;
		const speed = CONFIG.chestSpeed * (fromLeft ? 1 : -1);
		this.chests.push({
			position: [x, y],
			velocity: [speed, 0],
			size: CONFIG.monsterSize,
			hp: CONFIG.chestHp,
			maxHp: CONFIG.chestHp,
			color: '#a855f7',
			type: 'chest',
		});
	}

	tryAutoFire() {
		if (this.player.timer < this.player.attackCooldown) {
			return;
		}

		const targets = [];
		for (const monster of this.monsters) {
			const d = distance(monster.position, this.player.position);
			if (d <= this.player.range) {
				targets.push({ kind: 'monster', entity: monster, d });
			}
		}
		for (const chest of this.chests) {
			const d = distance(chest.position, this.player.position);
			if (d <= this.player.range) {
				targets.push({ kind: 'chest', entity: chest, d });
			}
		}

		if (targets.length === 0) { return; }
		targets.sort((a, b) => a.d - b.d);

		this.player.timer = 0;
		const shots = Math.min(this.player.multishot || 1, targets.length);
		const beamsThisFrame = [];
		const pierce = this.player.pierce || 0;
		for (let i = 0; i < shots; i++) {
			let remainingPierce = pierce;
			let idx = i;
			while (idx < targets.length) {
				const { kind, entity } = targets[idx];
				const dmg = this.computeDamage();
				const killed = this.applyDamage(entity, dmg);

				beamsThisFrame.push({
					from: [...this.player.position],
					to: [...entity.position],
					time: this.player.beamDuration,
				});

				if (killed) {
					if (kind === 'monster') {
						this.onKill(entity);
						this.monsters = this.monsters.filter(m => m !== entity);
					}
					else if (kind === 'chest') {
						this.onChestKill(entity);
						this.chests = this.chests.filter(c => c !== entity);
					}
				}

				if (kind === 'monster') {
					this.maybeApplySlow(entity);
					this.maybeApplyBleed(entity);
				}

				if (remainingPierce <= 0) { break; }
				remainingPierce -= 1;
				idx += 1;
			}
		}

		this.beams.push(...beamsThisFrame);
	}

	computeDamage() {
		const crit = Math.random() < (this.player.critChance || 0);
		const mult = crit ? (this.player.critMultiplier || 2) : 1;
		return this.player.damage * mult;
	}

	applyDamage(monster, damage) {
		monster.hp -= damage;
		return monster.hp <= 0;
	}

	addEffect(position, radius, color='rgba(255,255,255,ALPHA)', duration=0.3) {
		this.effects.push({ position: [...position], radius, color, duration, time: duration });
	}

	onKill(monster) {
		this.score += 1;
		const bonus = this.player.goldBonus || 1;
		this.gold += CONFIG.goldPerKill * bonus;
		this.addEffect(monster.position, 26, 'rgba(251,146,60,ALPHA)', 0.25);
	}

	onChestKill(chest) {
		const reward = randomUpgradeFor(this.player);
		if (reward) {
			reward.apply(this.player);
			this.player.range = Math.min(this.player.range, RANGE_CAP);
			this.rewardNote = { text: `Chest reward: ${reward.label}`, timer: 3 };
		}
		this.addEffect(chest.position, 30, 'rgba(168,85,247,ALPHA)', 0.35);
	}

	spawnBombStrike() {
		const angle = Math.random() * Math.PI * 2;
		const radiusWithin = Math.max(20, this.player.range - 10);
		const r = Math.random() * radiusWithin;
		const pos = [
			this.player.position[0] + Math.cos(angle) * r,
			this.player.position[1] + Math.sin(angle) * r,
		];
		const blastRadius = this.player.bombRadius || 80;
		const blastDamage = this.player.bombDamage || 6;
		this.monsters = addExplosionDamage(this.monsters, pos, blastRadius, blastDamage, m => this.onKill(m));
		this.addEffect(pos, blastRadius, 'rgba(244,63,94,ALPHA)', 0.45);
	}

	maybeApplySlow(monster) {
		if (this.player.slowChance <= 0) { return; }
		if (Math.random() <= this.player.slowChance) {
			monster.slowTimer = this.player.slowDuration;
			monster.slowFactor = this.player.slowStrength;
		}
	}

	maybeApplyBleed(monster) {
		if (!this.player.bleed) { return; }
		monster.bleedTimer = this.player.bleed.duration;
		monster.bleedDamage = this.player.bleed.damage;
	}

	prepareShop() {
		if (this.offers.length === 0) {
			this.offers = this.rollOffers();
		}
	}

	reroll() {
		if (this.gold < this.rerollCost) { return; }
		this.gold -= this.rerollCost;
		this.rerollCost += CONFIG.rerollCostGrowth;
		this.offers = this.rollOffers();
	}

	rollOffers() {
		const pool = UPGRADES.filter(u => !u.condition || u.condition(this.player));
		const picks = [];
		for (let i = 0; i < 3; i++) {
			if (pool.length === 0) { break; }
			const idx = Math.floor(Math.random() * pool.length);
			picks.push(pool[idx]);
			pool.splice(idx, 1);
		}
		return picks;
	}

	pickUpgrade(index) {
		if (!this.showShop) { return; }
		const offer = this.offers[index];
		if (!offer) { return; }
		if (this.gold < CONFIG.upgradeCost) { return; }

		this.gold -= CONFIG.upgradeCost;
		offer.apply(this.player);
		this.player.range = Math.min(this.player.range, RANGE_CAP);
		this.offers = this.rollOffers();
		this.rerollCost = CONFIG.rerollBaseCost;
	}

	startNextRound() {
		if (!this.showShop) { return; }
		this.showShop = false;
		this.gameOver = false;
		this.reset();
	}

	handleCollisions() {
		const playerHitRadius = this.player.radius + CONFIG.monsterSize * 0.5;
		for (const monster of this.monsters) {
			const d = distance(monster.position, this.player.position);
			if (d <= playerHitRadius) {
				this.gameOver = true;
				this.showShop = true;
				this.prepareShop();
				break;
			}
		}
	}

	handleInputs(events) {
		if (!this.showShop) { return; }

		for (const ev of events) {
			if (ev.type !== 'keydown') { continue; }

			if (ev.key === 'r' || ev.key === 'R') {
				this.reroll();
			}
			if (ev.key === 'Enter') {
				this.startNextRound();
			}
			if (ev.key === '1') { this.pickUpgrade(0); }
			if (ev.key === '2') { this.pickUpgrade(1); }
			if (ev.key === '3') { this.pickUpgrade(2); }
		}
	}

	didUpdate(deltaTime, events) {
		this.handleInputs(events);
		if (this.showShop) { return; }

		this.timeAlive += deltaTime;
		this.spawnInterval = Math.max(CONFIG.spawnIntervalMin, this.spawnInterval - CONFIG.spawnAcceleration * deltaTime);
		this.spawnTimer += deltaTime;
		if (this.spawnTimer >= this.spawnInterval) {
			this.spawnMonster();
			this.spawnTimer = 0;
		}

		this.chestTimer += deltaTime;
		if (this.chestTimer >= this.nextChestTime) {
			this.spawnChest();
			this.chestTimer = 0;
			this.nextChestTime = randomRange(CONFIG.chestInterval[0], CONFIG.chestInterval[1]);
		}

		for (const monster of this.monsters) {
			const slow = monster.slowTimer > 0 ? Math.max(0.1, 1 - monster.slowFactor) : 0;
			monster.position[0] += monster.velocity[0] * deltaTime * (1 - slow);
			monster.position[1] += monster.velocity[1] * deltaTime * (1 - slow);
			if (monster.slowTimer > 0) { monster.slowTimer -= deltaTime; }
			if (monster.bleedTimer > 0) {
				const tick = Math.min(deltaTime, monster.bleedTimer);
				monster.hp -= (monster.bleedDamage || 0) * tick;
				monster.bleedTimer -= tick;
				if (monster.hp <= 0) {
					this.onKill(monster);
					this.monsters = this.monsters.filter(m => m !== monster);
				}
			}
		}

		for (const chest of this.chests) {
			chest.position[0] += chest.velocity[0] * deltaTime;
			if (chest.position[0] < -50 || chest.position[0] > (this.screen.size?.[0] || CONFIG.canvasSize[0]) + 50) {
				this.chests = this.chests.filter(c => c !== chest);
			}
		}

		if (this.player.bombUnlocked) {
			this.player.bombTimer -= deltaTime;
			if (this.player.bombTimer <= 0) {
				this.spawnBombStrike();
				this.player.bombTimer = this.player.bombCooldown || 5;
			}
		}

		this.player.timer += deltaTime;
		this.tryAutoFire();

		for (const beam of this.beams) { beam.time -= deltaTime; }
		this.beams = this.beams.filter(beam => beam.time > 0);

		for (const fx of this.effects) { fx.time -= deltaTime; }
		this.effects = this.effects.filter(fx => fx.time > 0);

		if (this.rewardNote) {
			this.rewardNote.timer -= deltaTime;
			if (this.rewardNote.timer <= 0) { this.rewardNote = null; }
		}

		this.handleCollisions();
	}

	didRender(context) {
		const [w, h] = this.screen.size || CONFIG.canvasSize;

		context.save();
		context.fillStyle = '#0f172a';
		context.fillRect(0, 0, w, h);

		context.strokeStyle = 'rgba(103, 232, 249, 0.25)';
		context.lineWidth = 2;
		context.beginPath();
		context.arc(this.player.position[0], this.player.position[1], this.player.range, 0, Math.PI * 2);
		context.stroke();

		for (const fx of this.effects) {
			const alpha = Math.max(0, fx.time / fx.duration);
			const strokeColor = fx.color.includes('ALPHA') ? fx.color.replace('ALPHA', alpha.toFixed(2)) : fx.color;
			context.strokeStyle = strokeColor;
			context.lineWidth = 4;
			context.beginPath();
			context.arc(fx.position[0], fx.position[1], fx.radius, 0, Math.PI * 2);
			context.stroke();
		}

		for (const beam of this.beams) {
			context.strokeStyle = `rgba(94, 234, 212, ${beam.time / this.player.beamDuration})`;
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(beam.from[0], beam.from[1]);
			context.lineTo(beam.to[0], beam.to[1]);
			context.stroke();
		}

		for (const monster of this.monsters) {
			const half = monster.size / 2;
			context.fillStyle = monster.color;
			context.fillRect(monster.position[0] - half, monster.position[1] - half, monster.size, monster.size);
			context.fillStyle = 'rgba(15, 23, 42, 0.4)';
			context.fillRect(monster.position[0] - half, monster.position[1] - half - 8, monster.size, 5);
			context.fillStyle = '#22d3ee';
			const hpRatio = Math.max(0, monster.hp) / monster.maxHp;
			context.fillRect(monster.position[0] - half, monster.position[1] - half - 8, monster.size * hpRatio, 5);
		}

		for (const chest of this.chests) {
			const half = chest.size / 2;
			context.fillStyle = chest.color;
			context.fillRect(chest.position[0] - half, chest.position[1] - half, chest.size, chest.size);
			context.fillStyle = 'rgba(15, 23, 42, 0.4)';
			context.fillRect(chest.position[0] - half, chest.position[1] - half - 8, chest.size, 5);
			context.fillStyle = '#a5b4fc';
			const hpRatio = Math.max(0, chest.hp) / chest.maxHp;
			context.fillRect(chest.position[0] - half, chest.position[1] - half - 8, chest.size * hpRatio, 5);
		}

		context.fillStyle = '#38bdf8';
		context.beginPath();
		context.arc(this.player.position[0], this.player.position[1], this.player.radius, 0, Math.PI * 2);
		context.fill();

		context.fillStyle = '#e5e7eb';
		context.font = '16px "Segoe UI", sans-serif';
		context.fillText(`Score: ${this.score}`, 16, 26);
		context.fillText(`Gold: ${Math.floor(this.gold)}`, 16, 46);
		context.fillText(`Range ${Math.round(this.player.range)} / ${RANGE_CAP}`, 16, 66);
		context.fillText(`Damage ${this.player.damage}`, 16, 86);
		context.fillText(`Fire ${this.player.attackCooldown.toFixed(2)}s`, 16, 106);
		if (this.rewardNote) {
			context.fillStyle = '#c084fc';
			context.textAlign = 'center';
			context.fillText(this.rewardNote.text, w / 2, 30);
			context.textAlign = 'start';
		}

		if (this.showShop) {
			context.fillStyle = 'rgba(15, 23, 42, 0.8)';
			context.fillRect(0, 0, w, h);

			context.fillStyle = '#f97316';
			context.font = '32px "Segoe UI", sans-serif';
			context.textAlign = 'center';
			context.fillText('GAME OVER - Upgrade', w / 2, h / 2 - 140);

			const canBuy = this.gold >= CONFIG.upgradeCost;
			context.fillStyle = canBuy ? '#e5e7eb' : '#f87171';
			context.font = '18px "Segoe UI", sans-serif';
			context.fillText(`Gold: ${Math.floor(this.gold)} (Upgrade ${CONFIG.upgradeCost}, Reroll ${this.rerollCost})`, w / 2, h / 2 - 100);

			context.font = '18px "Segoe UI", sans-serif';
			const startY = h / 2 - 40;
			this.offers.forEach((offer, idx) => {
				const y = startY + idx * 40;
				context.fillStyle = '#22d3ee';
				context.fillText(`${idx + 1}. ${offer.label}`, w / 2, y);
			});

			context.fillStyle = '#e5e7eb';
			context.fillText('1/2/3 buy (rerolls), R reroll, Enter start next round', w / 2, h / 2 + 100);
			context.textAlign = 'start';
		}

		context.restore();
	}
}
