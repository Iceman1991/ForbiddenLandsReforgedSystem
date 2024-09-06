"use strict";
(() => {
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __esm = (fn, res) => function() {
        return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res
    };
    var define_GLOBALPATHS_default, init_define_GLOBALPATHS = __esm({
        "<define:GLOBALPATHS>"() {
            define_GLOBALPATHS_default = ["systems/forbidden-lands/templates/components/sheet-config.hbs", "systems/forbidden-lands/templates/components/tables-config.hbs", "systems/forbidden-lands/templates/components/item-chatcard.hbs", "systems/forbidden-lands/templates/components/modifiers-component.hbs", "systems/forbidden-lands/templates/components/sheet-config-modal.hbs", "systems/forbidden-lands/templates/journal/adventure-sites/adventure-site-sheet.hbs", "systems/forbidden-lands/templates/item/weapon/main-tab.hbs", "systems/forbidden-lands/templates/item/weapon/weapon-sheet.hbs", "systems/forbidden-lands/templates/item/spell/spell-sheet.hbs", "systems/forbidden-lands/templates/item/monster-attack/monster-attack-sheet.hbs", "systems/forbidden-lands/templates/item/hireling/hireling-sheet.hbs", "systems/forbidden-lands/templates/item/gear/main-tab.hbs", "systems/forbidden-lands/templates/item/gear/gear-sheet.hbs", "systems/forbidden-lands/templates/item/critical-injury/critical-injury-sheet.hbs", "systems/forbidden-lands/templates/item/raw-material/raw-material-sheet.hbs", "systems/forbidden-lands/templates/item/armor/main-tab.hbs", "systems/forbidden-lands/templates/item/armor/armor-sheet.hbs", "systems/forbidden-lands/templates/item/_shared-template-tabs/artifact-tab.hbs", "systems/forbidden-lands/templates/item/_shared-template-tabs/supply-tab.hbs", "systems/forbidden-lands/templates/item/talent/talent-sheet.hbs", "systems/forbidden-lands/templates/system/combat/combat.hbs", "systems/forbidden-lands/templates/components/character-generator/generator-sheet.hbs", "systems/forbidden-lands/templates/components/character-generator/list-component.hbs", "systems/forbidden-lands/templates/components/roll-engine/infos.hbs", "systems/forbidden-lands/templates/components/roll-engine/roll.hbs", "systems/forbidden-lands/templates/components/roll-engine/dialog.hbs", "systems/forbidden-lands/templates/components/roll-engine/spell-dialog.hbs", "systems/forbidden-lands/templates/components/roll-engine/tooltip.hbs", "systems/forbidden-lands/templates/item/building/building-sheet.hbs", "systems/forbidden-lands/templates/actor/stronghold/stronghold-sheet.hbs", "systems/forbidden-lands/templates/actor/_shared-template-tabs/gear-tab.hbs", "systems/forbidden-lands/templates/actor/monster/monster-sheet.hbs", "systems/forbidden-lands/templates/actor/party/party-sheet.hbs", "systems/forbidden-lands/templates/actor/character/npc-sheet.hbs", "systems/forbidden-lands/templates/actor/character/character-sheet.hbs", "systems/forbidden-lands/templates/actor/character/character-limited-sheet.hbs", "systems/forbidden-lands/templates/actor/stronghold/sheet-tabs/building-tab.hbs", "systems/forbidden-lands/templates/actor/stronghold/sheet-tabs/gear-tab.hbs", "systems/forbidden-lands/templates/actor/stronghold/sheet-tabs/hireling-tab.hbs", "systems/forbidden-lands/templates/actor/monster/sheet-tabs/combat-tab.hbs", "systems/forbidden-lands/templates/actor/party/components/member-component.hbs", "systems/forbidden-lands/templates/actor/party/components/action-component.hbs", "systems/forbidden-lands/templates/actor/party/sheet-tabs/main-tab.hbs", "systems/forbidden-lands/templates/actor/party/sheet-tabs/travel-tab.hbs", "systems/forbidden-lands/templates/actor/character/sheet-tabs/talent-tab.hbs", "systems/forbidden-lands/templates/actor/character/sheet-tabs/main-tab.hbs", "systems/forbidden-lands/templates/actor/character/sheet-tabs/bio-tab.hbs", "systems/forbidden-lands/templates/actor/character/sheet-tabs/combat-tab.hbs"]
        }
    });
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();

    function localizeString(string) {
        try {
            let localeString = CONFIG.fbl.i18n[string];
            return localeString || (localeString = string), game.i18n.localize(localeString)
        } catch {
            return string
        }
    }

    
    

    var ForbiddenLandsActor = class extends Actor {
        get actorProperties() {
            return this.system;
        }
        get attributes() {
            return this.actorProperties.attribute;
        }
        get conditions() {
            return this.actorProperties.condition;
        }
        get consumables() {
            return this.actorProperties.consumable;
        }
        get canAct() {
            return this.attributes ? Object.entries(this.attributes).every(([key, attribute]) => attribute.value > 0 || attribute.max <= 0 || key === "empathy") : !1;
        }
        get skills() {
            return this.actorProperties.skill;
        }
        get willpower() {
            return this.actorProperties.bio?.willpower;
        }
        get unlimitedPush() {
            return this.getFlag("forbidden-lands", "unlimitedPush") ?? !1;
        }
        getRollData() {
            return {
                alias: this.token?.name || this.name,
                actorId: this.id,
                actorType: this.type,
                canAct: this.canAct,
                sceneId: this.token?.parent.id,
                tokenId: this.token?.id,
                unlimitedPush: this.unlimitedPush
            };
        }
        getRollModifierOptions(...rollIdentifiers) {
            if (!rollIdentifiers.length) return [];
            let itemModifiers = this.items.reduce((array, item) => {
                let modifiers = item.getRollModifier(...rollIdentifiers);
                return modifiers ? array.concat(modifiers) : array;
            }, []);
            return rollIdentifiers.includes("dodge") && (itemModifiers.push({
                name: localizeString("ROLL.STANDING_DODGE"),
                value: -2,
                active: !0
            }), itemModifiers.push({
                name: localizeString("ROLL.DODGE_SLASH"),
                value: 2
            })), itemModifiers;
        }
        async createEmbeddedDocuments(embeddedName, data, options) {
            let newData = deepClone(data);
            Array.isArray(newData) || (newData = [newData]);
            let inlineRoll = /\[\[([d\d+\-*]+)\]\]/i,
                createRoll = async ([_match, group]) => (await new Roll(group).roll()).total;
            for await (let entity of newData) entity.system && (entity.system = await Object.entries(entity.system).reduce(async (obj, [key, value]) => {
                if (typeof value == "string" && value.match(inlineRoll)) {
                    let result = await createRoll(inlineRoll.exec(value));
                    value = value.replace(inlineRoll, result);
                }
                return {
                    ...await obj,
                    [key]: value
                };
            }, {}), CONFIG.fbl.carriedItemTypes.includes(entity.type) && (entity.flags["forbidden-lands"] = {
                ...entity.flags["forbidden-lands"],
                state: "carried"
            }));
            return super.createEmbeddedDocuments(embeddedName, newData, options);
        }
        static async create(data, options) {
            if (!data.img) switch (data.type) {
                case "party":
                    data.img = "systems/forbidden-lands/assets/fbl-sun.webp";
                    break;
                default:
                    data.img = `systems/forbidden-lands/assets/fbl-${data.type}.webp`;
                    break;
            }
            return super.create(data, options);
        }
        toggleCondition(conditionName) {
            let statusEffect = CONFIG.statusEffects.find(it => it.id === conditionName),
                currentEffect = Array.from(this.effects?.values()).find(it => it.icon === statusEffect.icon);
    
            if (currentEffect) {
                if (this.system.condition[conditionName].value) {
                    this.update({
                        [`system.condition.${conditionName}.value`]: !1
                    });
                }
                this.deleteEmbeddedDocuments("ActiveEffect", [currentEffect.id]);
            } else {
                this.createEmbeddedDocuments("ActiveEffect", [{
                    label: game.i18n.localize(statusEffect.label),
                    icon: statusEffect.icon,
                    changes: statusEffect.changes,
                    id: this.uuid,
                    statuses: statusEffect.statuses,
                    flags: {
                        core: {
                            statusId: statusEffect.id
                        }
                    }
                }]);
    
                if (conditionName === "cold") {
                    this.update({
                        "system.attribute.strength.value": this.system.attribute.strength.value - 1,
                        "system.attribute.wits.value": this.system.attribute.wits.value - 1
                    });
                    ChatMessage.create({
                        content: `<b>${this.name}</b> is now cold, losing 1 point in Strength and Wits.`,
                        speaker: ChatMessage.getSpeaker({actor: this})
                    });
                }
            }
        }
    
        hasStrongholdWithName() {
            let strongholds = game.actors.filter(actor => actor.type === 'stronghold');
            for (let stronghold of strongholds) {
                if (stronghold.name.includes(this.name)) {
                    return true;
                }
            }
            return false;
        }
    
        rest() {
            // Create a dialog for the player to choose between resting, sleeping, or staying in an inn
            new Dialog({
                title: "Rest, Sleep, or Stay in an Inn",
                content: `
                <p>Do you want to rest, sleep, or stay in an inn?</p>
            `,
                buttons: {
                    rest: {
                        label: "Rest",
                        callback: () => this.performRest("rest")
                    },
                    sleep: {
                        label: "Sleep",
                        callback: () => this.performRest("sleep")
                    },
                    inn: {
                        label: "Inn",
                        callback: () => this.performRest("inn")
                    }
                },
                default: "rest"
            }).render(true);
        }
    
        performRest(option) {
            const activeConditions = Object.entries(this.conditions ?? {}).filter(([_key, value]) => value?.value);
            const isBlocked = (...conditions) => conditions.some(condition => activeConditions.map(([key]) => key).includes(condition));
    
            const data = {
                attribute: {
                    agility: {
                        value: isBlocked("thirsty") ? this.attributes.agility.value : Math.min(this.attributes.agility.value + 1, this.attributes.agility.max)
                    },
                    strength: {
                        value: isBlocked("thirsty", "cold", "hungry") ? this.attributes.strength.value : Math.min(this.attributes.strength.value + 1, this.attributes.strength.max)
                    },
                    wits: {
                        value: isBlocked("thirsty", "cold", "sleepy") ? this.attributes.wits.value : Math.min(this.attributes.wits.value + 1, this.attributes.wits.max)
                    },
                    empathy: {
                        value: isBlocked("thirsty") ? this.attributes.empathy.value : Math.min(this.attributes.empathy.value + 1, this.attributes.empathy.max)
                    }
                }
            };
    
            // Remove the "sleepy" condition if "sleep" or "inn" is chosen
            if (option === "sleep" || option === "inn") {
                this.update({ "system.condition.sleepy.value": false });
    
                // Heal critical injuries
            }
    
            if ((option === "sleep" || option === "inn") && this.willpower && this.attributesAreMaxed()) {
                this.updateWillpower(option === "inn" ? 2 : 1);
            }
    
            this.update({ system: data });
            this.handleRestMessages(option, activeConditions);
        }
    
        attributesAreMaxed() {
            return (
                this.system.attribute.strength.value === this.system.attribute.strength.max &&
                this.system.attribute.agility.value === this.system.attribute.agility.max &&
                this.system.attribute.wits.value === this.system.attribute.wits.max &&
                this.system.attribute.empathy.value === this.system.attribute.empathy.max
            );
        }
    
        updateWillpower(increase) {
            const newWillpower = Math.min(this.willpower.value + increase, 10);
            this.update({ "system.bio.willpower.value": newWillpower });
        }
    
        handleRestMessages(option, activeConditions) {
            const formatter = new Intl.ListFormat(game.i18n.lang, { style: "long" });
            const activeConditionNames = activeConditions.map(([key]) => key);
            
            let content = `
                <div class="forbidden-lands chat-item dice-roll">
                    <img src="${this.img}" alt="">
                    <h3>${this.name}</h3>
                    <h4>${localizeString("ACTION.REST")}</h4>
                    <p>${this.name} chose: ${option}.</p>
            `;
            
            if (activeConditionNames.includes("sleepy")) {
                content += `<p>${this.name} ${localizeString("CONDITION.IS_NO_LONGER_SLEEPY")}.</p>`;
            }
            
            if (activeConditionNames.length) {
                content += `<p>${this.name} ${localizeString("CONDITION.SUFFERING_FROM")} ${formatter.format(activeConditionNames.filter(key => key !== "sleepy").map(key => `<b>${localizeString(this.conditions[key].label)}</b>`))}.</p>`;
            }
    
            content += `</div>`;
    
            ChatMessage.create({
                content,
                speaker: { actor: this }
            });
        }
    };
    
    


    init_define_GLOBALPATHS();
    var handlers = {
            Actor: handleActorMacro,
            Item: handleItemMacro
        },
        itemHandlers = {
            spell: handleSpellMacro,
            weapon: handleWeaponMacro,
            armor: handleWeaponMacro
        };

    function handleSpellMacro(actor, item) {
        return {
            command: `game.actors.get("${actor.id}").sheet.rollSpell("${item._id}")`,
            img: item.img,
            name: item.name,
            type: "script"
        }
    }
    async function handleWeaponMacro(actor, item) {
        let type = item.system.part === "shield" || item.system.category === "melee" ? await Dialog.prompt({
                title: game.i18n.localize("MACRO.CHOOSE_TYPE"),
                content: `
						<form class="macro-select">
						<h3>${game.i18n.localize("MACRO.CHOOSE_TYPE")}</h3>
							<label>
							<input type="radio" name="type" value="gear" checked />
							${game.i18n.localize("MACRO.TYPE.ATTACK")}</label>
							<label>
							<input type="radio" name="type" value="parry" />
							${game.i18n.localize("ACTION.PARRY")}</label>
							${item.system.part==="shield"?`<label>
							<input type="radio" name="type" value="shove" />
							${game.i18n.localize("ACTION.SHOVE")}</label>`:""}
							${item.system.category==="melee"?`<label>
							<input type="radio" name="type" value="disarm" />
							${game.i18n.localize("ACTION.DISARM")}</label>`:""}
						</form>
					`,
                callback: html => {
                    let form = html.find("form")[0];
                    return new FormData(form).get("type")
                },
                rejectClose: !0
            }) : item.type === "armor" ? "armor" : "gear",
            command = type === "gear" ? `game.actors.get("${actor.id}").sheet.rollGear("${item._id}")` : type === "armor" ? `game.actors.get("${actor.id}").sheet.rollSpecificArmor("${item._id}")` : `game.actors.get("${actor.id}").sheet.rollAction("${type}","${item._id}")`,
            name = type === "gear" ? item.name : `${item.name}: ${localizeString(type)}`;
        return {
            command,
            name,
            img: item.img,
            type: "script"
        }
    }
    async function handleActorMacro(data) {
        let actor = game.actors.get(data.id),
            imgs = await actor.getTokenImages();
        return {
            command: `game.actors.get("${data.id}").sheet.render(true)`,
            img: imgs[0],
            name: actor.name,
            type: "script"
        }
    }


    async function handleItemMacro(data) {
        let handler = itemHandlers[data.system.type];
        if (!handler) return {};
        let actor = game.actors.get(data.actorId),
            item = data.data;
        return handler(actor, item)
    }
    async function handleHotbarDrop(data, slot) {
        let handler = handlers[data.type];
        if (!handler) return;
        let {
            command,
            img,
            name,
            type
        } = await handler(data);
        if (!name || !command) return;
        let macro = game.macros.contents.find(m => m.name === name && m.command === command);
        macro || (macro = await Macro.create({
            command,
            img,
            name,
            type
        })), game.user.assignHotbarMacro(macro, slot)
    }
    async function importMacros() {
        if (game.packs.get("world.forbidden-lands-macros")) return;
        let pack = await CompendiumCollection.createCompendium({
                name: "forbidden-lands-macros",
                label: game.i18n.localize("MACRO.COMPENDIUM_NAME"),
                type: "Macro",
                system: "forbidden-lands"
            }),
            localizedMacros = (await foundry.utils.fetchJsonWithTimeout("/systems/forbidden-lands/assets/datasets/macros/macros.json")).map(m => ({
                ...m,
                name: game.i18n.localize(m.name)
            }));
        Macro.create(localizedMacros, {
            pack: pack.collection
        })
    }
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();

    function semverComp(min, curr, max, opt = {}) {
        if (!min && !max || !curr) throw new Error(`Missing Comparators. min ${min}; curr ${curr}; max ${max}`);
        return min = min && coerceNum(min), curr = curr && coerceNum(curr), max = max && coerceNum(max), min && max && opt.eqMin && opt.eqMax ? min === curr && curr === max : min && opt.eqMin ? min === curr : max && opt.eqMax ? max === curr : (min ? opt.gEqMin ? min = min <= curr : min = min < curr : min = !0, max ? opt.lEqMax ? max = curr <= max : max = curr < max : max = !0, !!(min && max))
    }

    function coerceNum(string) {
        if (typeof string != "string") throw new Error(`Wrong term passed ${string}`);
        let array = Array.from(string.split("."), v2 => Number.parseInt(v2));
        if (array.some(v2 => Number.isNaN(v2)) || array.length !== 3) throw new Error(`Invalid SemVer string: ${string}`);
        return array[0] = array[0] * 1e6, array[1] = array[1] * 1e3, array.reduce((sum, val) => sum + val, 0)
    }
    async function displayMessages() {
        let {
            messages
        } = await fetch("systems/forbidden-lands/assets/messages/messages.jsonc").then(resp => resp.text()).then(jsonc => JSON.parse(stripJSON(jsonc)));
        for (let message of messages) handleDisplay(message)
    }
    var stripJSON = data => data.replace(/[^:]\/\/(.*)/g, ""),
        handleDisplay = msg => {
            let {
                content,
                title,
                type
            } = msg;
            if (isCurrent(msg)) {
                if (type === "prompt") return displayPrompt(title, content);
                if (type === "chat") return sendToChat(title, content)
            }
        },
        isCurrent = msg => {
            let isDisplayable = !msg.display === "once" || !hasDisplayed(msg.title),
                correctCoreVersion = foundry.utils.isNewerVersion(msg["max-core-version"] ?? "100.0.0", game.version) && foundry.utils.isNewerVersion(game.version, msg["min-core-version"] ?? "0.0.0"),
                correctSysVersion = semverComp(msg["min-sys-version"] ?? "0.0.0", game.system.version, msg["max-sys-version"] ?? "100.0.0", {
                    gEqMin: !0
                });
            return isDisplayable && correctCoreVersion && correctSysVersion
        },
        hasDisplayed = identifier => !!game.settings.get("forbidden-lands", "messages")?.includes(identifier),
        displayPrompt = (title, content) => (content = content.replace("{name}", game.user.name), Dialog.prompt({
            title,
            content,
            label: "Understood!",
            options: {
                width: 450
            },
            callback: () => setDisplayed(title)
        })),
        sendToChat = (title, content) => (content = content.replace("{name}", game.user.name), setDisplayed(title), ChatMessage.create({
            title,
            content: `<div class="forbidden-lands chat-item">${content}</div>`
        })),
        setDisplayed = async identifier => {
            let settings = game.settings.get("forbidden-lands", "messages");
            settings.push(identifier), await game.settings.set("forbidden-lands", "messages", settings.flat())
        };
    init_define_GLOBALPATHS();

    function registerYZURLabels() {
        CONFIG.YZUR.Icons.getLabel = (type, result) => `<img src="systems/forbidden-lands/assets/dice/${type}-${result}.png" alt="${result}" title="${result}" />`
    }
    var ForbiddenLandsD6 = class extends Die {
        constructor(termData) {
            termData.faces = 6, super(termData)
        }
        static DENOMINATION = 6;
        static getResultLabel(result) {
            return `<img src="systems/forbidden-lands/assets/dice/skill-${result}.png" alt="${result}" title="${result}" />`
        }
    };
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();

    function safeParseJSON(json) {
        try {
            return JSON.parse(json)
        } catch {
            return null
        }
    }
    init_define_GLOBALPATHS();
    var YearZeroDie = class _YearZeroDie extends Die {
        constructor(termData = {}) {
            termData.faces = Number.isInteger(termData.faces) ? termData.faces : 6, super(termData), this.maxPush == null && (this.maxPush = termData.maxPush ?? 1)
        }
        get denomination() {
            return this.constructor.DENOMINATION
        }
        get type() {
            return this.constructor.TYPE
        }
        get pushable() {
            if (this.pushCount >= this.maxPush) return !1;
            for (let r of this.results)
                if (!(!r.active || r.discarded) && !this.constructor.LOCKED_VALUES.includes(r.result)) return !0;
            return !1
        }
        get pushCount() {
            return this.results.reduce((c, r) => Math.max(c, r.indexPush || 0), 0)
        }
        get pushed() {
            return this.pushCount > 0
        }
        get isYearZeroDie() {
            return !0
        }
        get success() {
            if (!this._evaluated) return;
            let s = this.results.reduce((tot, r) => r.active ? r.count !== void 0 ? tot + r.count : this.constructor.SUCCESS_TABLE ? tot + this.constructor.SUCCESS_TABLE[r.result] : tot + (r.result >= 6 ? 1 : 0) : tot, 0);
            return this.type === "neg" ? -s : s
        }
        get failure() {
            if (this._evaluated) return this.results.reduce((tot, r) => r.active ? tot + (r.result <= 1) : tot, 0)
        }
        async roll(options = {}) {
            let roll = await super.roll(options);
            return roll.indexResult = options.indexResult, roll.indexResult == null && (roll.indexResult = 1 + this.results.reduce((c, r) => {
                let i = r.indexResult;
                return i == null && (i = -1), Math.max(c, i)
            }, -1)), roll.indexPush = options.indexPush ?? this.pushCount, this.results[this.results.length - 1] = roll, roll
        }
        count(n) {
            return this.values.filter(v2 => v2 === n).length
        }
        push() {
            if (!this.pushable) return this;
            let indexPush = this.pushCount + 1,
                indexesResult = [];
            for (let r of this.results) !r.active || r.locked || (this.constructor.LOCKED_VALUES.includes(r.result) ? r.hidden = !0 : (r.active = !1, r.discarded = !0, r.pushed = !0, r.hidden = !0, indexesResult.push(r.indexResult)));
            for (let i = 0; i < indexesResult.length; i++) this.roll({
                indexResult: indexesResult[i],
                indexPush
            });
            return this
        }
        nopush() {
            this.maxPush = 0
        }
        setpush(modifier) {
            let rgx = /p([0-9]+)?/i,
                match = modifier.match(rgx);
            if (!match) return !1;
            let [, max] = match;
            max = parseInt(max) ?? 1, this.maxPush = max
        }
        getResultLabel(result) {
            return CONFIG.YZUR.Icons.getLabel(this.constructor.TYPE, result.result)
        }
        getResultCSS(result) {
            let hasSuccess = result.success !== void 0,
                hasFailure = result.failure !== void 0,
                isMax = !1,
                isMin = !1;
            if (this.type === "neg") isMax = !1, isMin = result.result === 6;
            else if (this instanceof _YearZeroDie) {
                let noMin = ["skill", "arto", "loc"];
                isMax = result.result === this.faces || result.result >= 6, isMin = result.result === 1 && !noMin.includes(this.type)
            } else isMax = result.result === this.faces, isMin = result.result === 1;
            return [this.constructor.name.toLowerCase(), "d" + this.faces, hasSuccess ? "success" : null, hasFailure ? "failure" : null, result.rerolled ? "rerolled" : null, result.exploded ? "exploded" : null, result.discarded ? "discarded" : null, result.pushed ? "pushed" : null, !(hasSuccess || hasFailure) && isMin ? "min" : null, !(hasSuccess || hasFailure) && isMax ? "max" : null]
        }
        getTooltipData() {
            return {
                formula: this.expression,
                total: this.success,
                banes: this.failure,
                faces: this.faces,
                number: this.number,
                type: this.type,
                isYearZeroDie: this.isYearZeroDie,
                flavor: this.options.flavor ?? (CONFIG.YZUR?.Dice?.localizeDieTerms ? game.i18n.localize(`YZUR.DIETERMS.${this.constructor.name}`) : null),
                rolls: this.results.map(r => ({
                    result: this.getResultLabel(r),
                    classes: this.getResultCSS(r).filterJoin(" "),
                    row: r.indexPush,
                    col: r.indexResult
                }))
            }
        }
    };
    YearZeroDie.TYPE = "blank";
    YearZeroDie.LOCKED_VALUES = [6];
    YearZeroDie.SERIALIZE_ATTRIBUTES.push("maxPush");
    YearZeroDie.MODIFIERS = foundry.utils.mergeObject({
        p: "setpush",
        np: "nopush"
    }, Die.MODIFIERS);
    var BaseDie = class extends YearZeroDie {};
    BaseDie.TYPE = "base";
    BaseDie.DENOMINATION = "b";
    BaseDie.LOCKED_VALUES = [1, 6];
    var SkillDie = class extends YearZeroDie {};
    SkillDie.TYPE = "skill";
    SkillDie.DENOMINATION = "s";
    var GearDie = class extends YearZeroDie {};
    GearDie.TYPE = "gear";
    GearDie.DENOMINATION = "g";
    GearDie.LOCKED_VALUES = [1, 6];
    var NegativeDie = class extends SkillDie {};
    NegativeDie.TYPE = "neg";
    NegativeDie.DENOMINATION = "n";
    var StressDie = class extends YearZeroDie {};
    StressDie.TYPE = "stress";
    StressDie.DENOMINATION = "z";
    StressDie.LOCKED_VALUES = [1, 6];
    var ArtifactDie = class extends SkillDie {
        getResultLabel(result) {
            return CONFIG.YZUR.Icons.getLabel(`d${this.constructor.DENOMINATION}`, result.result)
        }
    };
    ArtifactDie.TYPE = "arto";
    ArtifactDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];
    ArtifactDie.LOCKED_VALUES = [6, 7, 8, 9, 10, 11, 12];
    var D8ArtifactDie = class extends ArtifactDie {
        constructor(termData = {}) {
            termData.faces = 8, super(termData)
        }
    };
    D8ArtifactDie.DENOMINATION = "8";
    var D10ArtifactDie = class extends ArtifactDie {
        constructor(termData = {}) {
            termData.faces = 10, super(termData)
        }
    };
    D10ArtifactDie.DENOMINATION = "10";
    var D12ArtifactDie = class extends ArtifactDie {
        constructor(termData = {}) {
            termData.faces = 12, super(termData)
        }
    };
    D12ArtifactDie.DENOMINATION = "12";
    var TwilightDie = class extends ArtifactDie {
        getResultLabel(result) {
            return CONFIG.YZUR.Icons.getLabel("base", result.result)
        }
    };
    TwilightDie.TYPE = "base";
    TwilightDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
    TwilightDie.LOCKED_VALUES = [1, 6, 7, 8, 9, 10, 11, 12];
    var D6TwilightDie = class extends TwilightDie {
        constructor(termData = {}) {
            termData.faces = 6, super(termData)
        }
    };
    D6TwilightDie.DENOMINATION = "6";
    var D8TwilightDie = class extends TwilightDie {
        constructor(termData = {}) {
            termData.faces = 8, super(termData)
        }
    };
    D8TwilightDie.DENOMINATION = "8";
    var D10TwilightDie = class extends TwilightDie {
        constructor(termData = {}) {
            termData.faces = 10, super(termData)
        }
    };
    D10TwilightDie.DENOMINATION = "10";
    var D12TwilightDie = class extends TwilightDie {
        constructor(termData = {}) {
            termData.faces = 12, super(termData)
        }
    };
    D12TwilightDie.DENOMINATION = "12";
    var AmmoDie = class extends YearZeroDie {
        constructor(termData = {}) {
            termData.faces = 6, super(termData)
        }
    };
    AmmoDie.TYPE = "ammo";
    AmmoDie.DENOMINATION = "m";
    AmmoDie.LOCKED_VALUES = [1, 6];
    var LocationDie = class extends YearZeroDie {
        constructor(termData = {}) {
            termData.faces = 6, super(termData)
        }
        get pushable() {
            return !1
        }
        roll(options) {
            let roll = super.roll(options);
            return roll.count = 0, this.results[this.results.length - 1] = roll, roll
        }
    };
    LocationDie.TYPE = "loc";
    LocationDie.DENOMINATION = "l";
    LocationDie.LOCKED_VALUES = [1, 2, 3, 4, 5, 6];
    var BladeRunnerDie = class extends ArtifactDie {
        getResultLabel(result) {
            return CONFIG.YZUR.Icons.getLabel("base", result.result)
        }
    };
    BladeRunnerDie.TYPE = "base";
    BladeRunnerDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
    BladeRunnerDie.LOCKED_VALUES = [1];
    var D6BladeRunnerDie = class extends BladeRunnerDie {
        constructor(termData = {}) {
            termData.faces = 6, super(termData)
        }
    };
    D6BladeRunnerDie.DENOMINATION = "6";
    D6BladeRunnerDie.LOCKED_VALUES = [1, 6];
    var D8BladeRunnerDie = class extends BladeRunnerDie {
        constructor(termData = {}) {
            termData.faces = 8, super(termData)
        }
    };
    D8BladeRunnerDie.DENOMINATION = "8";
    D8BladeRunnerDie.LOCKED_VALUES = [1, 6, 7, 8];
    var D10BladeRunnerDie = class extends BladeRunnerDie {
        constructor(termData = {}) {
            termData.faces = 10, super(termData)
        }
    };
    D10BladeRunnerDie.DENOMINATION = "10";
    D10BladeRunnerDie.LOCKED_VALUES = [1, 10];
    var D12BladeRunnerDie = class extends BladeRunnerDie {
        constructor(termData = {}) {
            termData.faces = 12, super(termData)
        }
    };
    D12BladeRunnerDie.DENOMINATION = "12";
    D12BladeRunnerDie.LOCKED_VALUES = [1, 10, 11, 12];
    var YZUR = {
            game: "",
            Chat: {
                showInfos: !0,
                diceSorting: ["base", "skill", "neg", "gear", "arto", "loc", "ammo"]
            },
            Roll: {
                chatTemplate: "templates/dice/roll.html",
                tooltipTemplate: "templates/dice/tooltip.html",
                infosTemplate: "templates/dice/infos.hbs"
            },
            Dice: {
                localizeDieTerms: !0,
                DIE_TYPES: ["base", "skill", "neg", "gear", "stress", "arto", "ammo", "loc"],
                DIE_TERMS: {
                    base: BaseDie,
                    skill: SkillDie,
                    neg: NegativeDie,
                    gear: GearDie,
                    stress: StressDie,
                    artoD8: D8ArtifactDie,
                    artoD10: D10ArtifactDie,
                    artoD12: D12ArtifactDie,
                    a: D12TwilightDie,
                    b: D10TwilightDie,
                    c: D8TwilightDie,
                    d: D6TwilightDie,
                    ammo: AmmoDie,
                    loc: LocationDie,
                    brD12: D12BladeRunnerDie,
                    brD10: D10BladeRunnerDie,
                    brD8: D8BladeRunnerDie,
                    brD6: D6BladeRunnerDie
                }
            },
            Icons: {
                getLabel: function(type, result) {
                    return ["d8", "d10", "d12"].includes(type) && (type = "arto"), String(CONFIG.YZUR.Icons[CONFIG.YZUR.game][type][result])
                },
                myz: {
                    base: {
                        1: "\u2623",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2622"
                    },
                    skill: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2622"
                    },
                    neg: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2796"
                    },
                    gear: {
                        1: "\u{1F4A5}",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2622"
                    }
                },
                fbl: {
                    base: {
                        1: "\u2620",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2694\uFE0F"
                    },
                    skill: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2694\uFE0F"
                    },
                    neg: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2796"
                    },
                    gear: {
                        1: "\u{1F4A5}",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u2694\uFE0F"
                    },
                    arto: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: 6,
                        7: 7,
                        8: 8,
                        9: 9,
                        10: 10,
                        11: 11,
                        12: 12
                    }
                },
                alien: {
                    skill: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u{1F4A0}"
                    },
                    stress: {
                        1: "\u{1F631}",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u{1F4A0}"
                    }
                },
                tales: {
                    skill: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u269B\uFE0F"
                    }
                },
                cor: {
                    skill: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u{1F41E}"
                    }
                },
                vae: {
                    skill: {
                        1: 1,
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u{1F98B}"
                    }
                },
                t2k: {
                    base: {
                        1: "\u{1F4A5}",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: 6,
                        7: 7,
                        8: 8,
                        9: 9,
                        10: 10,
                        11: 11,
                        12: 12
                    },
                    ammo: {
                        1: "\u{1F4A5}",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: "\u{1F3AF}"
                    },
                    loc: {
                        1: "L",
                        2: "T",
                        3: "T",
                        4: "T",
                        5: "A",
                        6: "H"
                    }
                },
                br: {
                    base: {
                        1: "\u{1F984}",
                        2: 2,
                        3: 3,
                        4: 4,
                        5: 5,
                        6: 6,
                        7: 7,
                        8: 8,
                        9: 9,
                        10: 10,
                        11: 11,
                        12: 12
                    }
                }
            }
        },
        GameTypeError2 = class extends TypeError {
            constructor(msg) {
                super(`Unknown game: "${msg}". Allowed games are: ${YearZeroRollManager.GAMES.join(", ")}.`), this.name = "YZUR | GameType Error"
            }
        },
        DieTermError = class extends TypeError {
            constructor(msg) {
                super(`Unknown die term: "${msg}". Allowed terms are: ${Object.keys(CONFIG.YZUR.Dice.DIE_TERMS).join(", ")}.`), this.name = "YZUR | DieTerm Error"
            }
        },
        YearZeroRoll = class _YearZeroRoll extends Roll {
            constructor(formula, data = {}, options = {}) {
                options.name == null && (options.name = data.name), options.game == null && (options.game = data.game), options.maxPush == null && (options.maxPush = data.maxPush), super(formula, data, options), this.game || (this.game = CONFIG.YZUR.game ?? "myz"), options.maxPush != null && (this.maxPush = options.maxPush)
            }
            get game() {
                return this.options.game
            }
            set game(yzGame) {
                this.options.game = yzGame
            }
            get name() {
                return this.options.name
            }
            set name(str) {
                this.options.name = str
            }
            set maxPush(n) {
                this.options.maxPush = n;
                for (let t of this.terms) t instanceof YearZeroDie && (t.maxPush = n)
            }
            get maxPush() {
                return this.terms.reduce((max, t) => t instanceof YearZeroDie ? Math.max(max, t.maxPush) : max, null)
            }
            get size() {
                return this.terms.reduce((s, t) => t instanceof YearZeroDie ? s + t.number : s, 0)
            }
            get pushCount() {
                return this.terms.reduce((c, t) => Math.max(c, t.pushCount || 0), 0)
            }
            get pushed() {
                return this.pushCount > 0
            }
            get pushable() {
                return this.pushCount < this.maxPush && this.terms.some(t => t.pushable)
            }
            get successCount() {
                return this.terms.reduce((sc, t) => sc + (t.success ?? 0), 0)
            }
            get baneCount() {
                let banableTypes = ["base", "gear", "stress", "ammo"],
                    count = 0;
                for (let bt of banableTypes) count += this.count(bt, 1);
                return count
            }
            get attributeTrauma() {
                return this.count("base", 1)
            }
            get gearDamage() {
                return this.count("gear", 1)
            }
            get stress() {
                return this.count("stress")
            }
            get panic() {
                return this.count("stress", 1)
            }
            get mishap() {
                return !1
            }
            get ammoSpent() {
                let mt = this.getTerms("ammo");
                return mt.length ? mt.reduce((tot, t) => tot + t.values.reduce((a, b3) => a + b3, 0), 0) : 0
            }
            get hitCount() {
                return this.count("ammo", 6)
            }
            get jamCount() {
                let n = this.count("ammo", 1);
                return n > 0 ? n + this.attributeTrauma : 0
            }
            get jammed() {
                return this.pushed ? this.jamCount >= 2 : !1
            }
            get baseSuccessQty() {
                return this.successCount - this.hitCount
            }
            get hitLocations() {
                let lt = this.getTerms("loc");
                return lt.length ? lt.reduce((tot, t) => tot.concat(t.values), []) : []
            }
            get bestHitLocation() {
                if (this.hitLocations.length) return Math.max(...this.hitLocations)
            }
            static create(formula, data = {}, options = {}) {
                return new _YearZeroRoll(formula, data, options)
            }
            static forge(dice = [], {
                title,
                yzGame = null,
                maxPush = 1
            } = {}, options = {}) {
                if (yzGame = yzGame ?? options.game ?? CONFIG.YZUR?.game, !YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError2(yzGame);
                if (!Array.isArray(dice) && typeof dice == "object" && !Object.keys(dice).includes("term")) {
                    let _dice = [];
                    for (let [term, n] of Object.entries(dice)) {
                        if (n <= 0) continue;
                        let deno = CONFIG.YZUR.Dice.DIE_TERMS[term].DENOMINATION;
                        deno = CONFIG.Dice.terms[deno].DENOMINATION, _dice.push({
                            term: deno,
                            number: n
                        })
                    }
                    dice = _dice
                }
                Array.isArray(dice) || (dice = [dice]);
                let out = [];
                for (let d of dice) out.push(_YearZeroRoll._getTermFormulaFromBlok(d));
                let formula = out.join(" + ");
                _YearZeroRoll.validate(formula) || (formula = yzGame === "t2k" ? "1d6" : "1ds"), options.name == null && (options.name = title), options.game == null && (options.game = yzGame), options.maxPush == null && (options.maxPush = maxPush);
                let roll = _YearZeroRoll.create(formula, {}, options);
                return CONFIG.debug.dice, roll
            }
            static createFromDiceQuantities(dice = {}, {
                title,
                yzGame = null,
                maxPush = 1,
                push = !1
            } = {}) {
                return _YearZeroRoll.forge(dice, {
                    title,
                    yzGame,
                    maxPush
                })
            }
            static _getTermFormulaFromBlok(termBlok) {
                let {
                    term,
                    number,
                    flavor,
                    maxPush
                } = termBlok;
                return _YearZeroRoll.generateTermFormula(number, term, flavor, maxPush)
            }
            static generateTermFormula(number, term, flavor = "", maxPush = null) {
                let f3 = `${number}d${term}`;
                return typeof maxPush == "number" && (f3 += `p${maxPush}`), flavor && (f3 += `[${flavor}]`), f3
            }
            getTerms(search) {
                return typeof search == "string" ? this.terms.filter(t => t.type === search) : this.terms.filter(t => {
                    let f3 = !0;
                    if (search.type != null && (f3 = f3 && search.type === t.type), search.number != null && (f3 = f3 && search.number === t.number), search.faces != null && (f3 = f3 && search.faces === t.faces), search.options)
                        for (let key in search.options) f3 = f3 && search.options[key] === t.options[key];
                    if (search.results)
                        for (let key in search.results) f3 = f3 && t.results.some(r => r[key] === search.results[key]);
                    return f3
                })
            }
            count(type, seed = null, comparison = "=") {
                return this.terms.reduce((c, t) => {
                    if (t.type === type)
                        if (t.results.length)
                            for (let r of t.results) r.active && (seed != null ? comparison === ">" ? r.result > seed && c++ : comparison === ">=" ? r.result >= seed && c++ : comparison === "<" ? r.result < seed && c++ : comparison === "<=" ? r.result <= seed && c++ : r.result === seed && c++ : c++);
                        else seed != null ? c += 0 : c += t.number;
                    return c
                }, 0)
            }
            async addDice(qty, type, {
                range = 6,
                value = null,
                options
            } = {}) {
                if (!qty) return this;
                let search = {
                    type,
                    faces: range,
                    options
                };
                if (qty < 0) return this.removeDice(-qty, search);
                value != null && !this._evaluated && await this.roll({
                    async: !0
                });
                let term = this.getTerms(search)[0];
                if (term)
                    for (; qty > 0; qty--) term.number++, this._evaluated && (term.roll(), value != null && (term.results[term.results.length - 1].result = value));
                else {
                    let cls = CONFIG.YZUR.Dice.DIE_TERMS[type];
                    term = new cls({
                        number: qty,
                        faces: range,
                        maxPush: this.maxPush ?? 1,
                        options
                    }), this._evaluated && (await term.evaluate({
                        async: !0
                    }), value != null && term.results.forEach(r => r.result = value)), this.terms.length > 0 && this.terms.push(new OperatorTerm({
                        operator: type === "neg" ? "-" : "+"
                    })), this.terms.push(term)
                }
                return this._formula = this.constructor.getFormula(this.terms), this._evaluated && (this._total = this._evaluateTotal()), this
            }
            removeDice(qty, search, {
                discard = !1,
                disable = !1
            } = {}) {
                if (!qty) return this;
                for (; qty > 0; qty--) {
                    let term = this.getTerms(search)[0];
                    if (term) {
                        if (term.number--, term.number <= 0) {
                            let type = search.type ?? search,
                                index = this.terms.findIndex(t => t.type === type && t.number === 0);
                            this.terms.splice(index, 1), this.terms[index - 1]?.operator && this.terms.splice(index - 1, 1)
                        } else if (this._evaluated) {
                            let index = term.results.findIndex(r => r.active);
                            if (index < 0) break;
                            discard || disable ? (discard && (term.results[index].discarded = discard), disable && (term.results[index].active = !disable)) : term.results.splice(index, 1)
                        }
                    } else break
                }
                return this._formula = this.constructor.getFormula(this.terms), this._evaluated && (this.terms.length ? this._total = this._evaluateTotal() : this._total = 0), this
            }
            async push({
                async
            } = {}) {
                return this._evaluated || await this.evaluate({
                    async
                }), this.pushable ? (this.terms.forEach(t => t instanceof YearZeroDie ? t.push() : t), this._evaluated = !1, await this.evaluate({
                    async
                }), this) : this
            }
            async modify(mod = 0) {
                if (mod)
                    if (this.game === "t2k" || this.game === "br") {
                        let diceMap = [null, 6, 8, 10, 12, 1 / 0],
                            typesMap = ["d", "d", "c", "b", "a", "a"],
                            refactorRange = (range, n) => diceMap[diceMap.indexOf(range) + n],
                            getTypeFromRange = range => typesMap[diceMap.indexOf(range)],
                            _terms = this.getTerms("base"),
                            dice = _terms.flatMap(t => new Array(t.number).fill(t.faces));
                        if (this.game === "br") {
                            let lowest = Math.min(...dice);
                            if (mod > 0) dice.push(lowest);
                            else if (mod < 0) {
                                let i = dice.indexOf(lowest);
                                dice.splice(i, 1)
                            }
                            mod = 0
                        } else
                            for (; mod !== 0;) {
                                let i;
                                if (mod > 0 ? (dice.length < 2 ? (i = 1, dice.push(diceMap[1])) : (i = dice.indexOf(Math.min(...dice)), dice[i] = refactorRange(dice[i], 1)), mod--) : (i = dice.indexOf(Math.max(...dice)), dice[i] = refactorRange(dice[i], -1), mod++), dice[i] === 1 / 0) dice[i] = refactorRange(dice[i], -1);
                                else if (dice[i] === null) dice.length > 1 ? dice.splice(i, 1) : dice[i] = refactorRange(dice[i], 1);
                                else if (dice[i] === void 0) throw new Error(`YZUR | YearZeroRoll#modify<T2K> | dice[${i}] is out of bounds (mod: ${mod})`)
                            }
                        this.removeDice(100, "base");
                        let skilled = _terms.length > 1 && dice.length > 1;
                        for (let index = 0; index < dice.length; index++) {
                            let ti = Math.min(index, skilled ? 1 : 0);
                            await this.addDice(1, getTypeFromRange(dice[index]), {
                                range: dice[index],
                                options: foundry.utils.deepClone(_terms[ti].options)
                            })
                        }
                    } else if (["myz", "fbl", "alien"].includes(this.game)) {
                    let skill = this.count("skill"),
                        neg = Math.min(skill + mod, 0);
                    for (await this.addDice(mod, "skill"), neg < 0 && (this.game === "alien" ? await this.addDice(neg, "stress") : await this.addDice(neg, "neg")); this.count("skill") > 0 && this.count("neg") > 0;) this.removeDice(1, "skill"), this.removeDice(1, "neg")
                } else {
                    let skill = this.count("skill");
                    mod < 0 && (mod = Math.max(-skill + 1, mod)), await this.addDice(mod, "skill")
                } else return this;
                if (this._evaluated)
                    for (let t of this.terms) t._evaluated || await t.evaluate();
                return this
            }
            async getTooltip() {
                let parts = this.dice.map(d => d.getTooltipData()).sort((a, b3) => {
                    let sorts = CONFIG?.YZUR?.Chat?.diceSorting || YZUR.Chat.diceSorting || [];
                    if (!sorts.length) return 0;
                    let at = sorts.indexOf(a.type),
                        bt = sorts.indexOf(b3.type);
                    return at - bt
                });
                if (this.pushed)
                    for (let part of parts) {
                        let matrix = [],
                            n = part.number,
                            p2 = this.pushCount;
                        for (; p2 >= 0; p2--) matrix[p2] = new Array(n).fill(void 0);
                        for (let r of part.rolls) {
                            let row = r.row || 0,
                                col = r.col || 0;
                            matrix[row][col] = r
                        }
                        part.rolls = matrix
                    }
                return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
                    parts,
                    pushed: this.pushed,
                    pushCounts: this.pushed ? [...Array(this.pushCount + 1).keys()].sort((a, b3) => b3 - a) : void 0,
                    config: CONFIG.YZUR ?? {},
                    options: this.options
                })
            }
            async getRollInfos(template = null) {
                template = template ?? CONFIG.YZUR?.Roll?.infosTemplate;
                let context = {
                    roll: this
                };
                return renderTemplate(template, context)
            }
            async render(chatOptions = {}) {
                CONFIG.debug.dice, chatOptions = foundry.utils.mergeObject({
                    user: game.user.id,
                    flavor: this.name,
                    template: this.constructor.CHAT_TEMPLATE,
                    blind: !1
                }, chatOptions);
                let isPrivate = chatOptions.isPrivate;
                this._evaluated || await this.evaluate({
                    async: !0
                });
                let chatData = {
                    formula: isPrivate ? "???" : this._formula,
                    flavor: isPrivate ? null : chatOptions.flavor,
                    user: chatOptions.user,
                    tooltip: isPrivate ? "" : await this.getTooltip(),
                    total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
                    success: isPrivate ? "?" : this.successCount,
                    showInfos: isPrivate ? !1 : CONFIG.YZUR?.Chat?.showInfos,
                    infos: isPrivate ? null : await this.getRollInfos(chatOptions.infosTemplate),
                    pushable: isPrivate ? !1 : this.pushable,
                    options: chatOptions,
                    isPrivate,
                    roll: this
                };
                return renderTemplate(chatOptions.template, chatData)
            }
            async toMessage(messageData = {}, {
                rollMode = null,
                create = !0
            } = {}) {
                return messageData = foundry.utils.mergeObject({
                    user: game.user.id,
                    speaker: ChatMessage.getSpeaker(),
                    content: this.total,
                    type: CONST.CHAT_MESSAGE_TYPES.ROLL
                }, messageData), await super.toMessage(messageData, {
                    rollMode,
                    create
                })
            }
            duplicate() {
                return this.constructor.fromData(this.toJSON())
            }
        },
        YearZeroRollManager = class _YearZeroRollManager {
            constructor() {
                throw new SyntaxError(`YZUR | ${this.constructor.name} cannot be instanciated!`)
            }
            static register(yzGame, config, options = {}) {
                _YearZeroRollManager._overrideDiceTermFromData(), _YearZeroRollManager.registerConfig(config), _YearZeroRollManager._initialize(yzGame), _YearZeroRollManager.registerDice(yzGame, options?.index)
            }
            static registerConfig(config) {
                CONFIG.YZUR = foundry.utils.mergeObject(YZUR, config)
            }
            static registerDice(yzGame, i) {
                if (!yzGame || typeof yzGame != "string") throw new SyntaxError("YZUR | A game must be specified for the registration.");
                _YearZeroRollManager.GAMES.includes(yzGame) || _YearZeroRollManager.DIE_TERMS_MAP[yzGame] || (_YearZeroRollManager.DIE_TERMS_MAP[yzGame] = []);
                let diceTypes = _YearZeroRollManager.DIE_TERMS_MAP[yzGame];
                for (let type of diceTypes) _YearZeroRollManager.registerDie(type);
                _YearZeroRollManager.registerRoll(void 0, i)
            }
            static registerRoll(cls = YearZeroRoll, i = 0) {
                CONFIG.Dice.rolls[i] = cls, CONFIG.Dice.rolls[i].CHAT_TEMPLATE = CONFIG.YZUR.Roll.chatTemplate, CONFIG.Dice.rolls[i].TOOLTIP_TEMPLATE = CONFIG.YZUR.Roll.tooltipTemplate, CONFIG.YZUR.Roll.index = i, i > 0 && _YearZeroRollManager._overrideRollCreate(i)
            }
            static registerDie(term) {
                let cls = CONFIG.YZUR.Dice.DIE_TERMS[term];
                if (!cls) throw new DieTermError(term);
                let deno = cls.DENOMINATION;
                if (!deno) throw new SyntaxError(`YZUR | Undefined DENOMINATION for "${cls.name}".`);
                let reg = CONFIG.Dice.terms[deno];
                CONFIG.Dice.terms[deno] = cls
            }
            static registerCustomDie(term, data) {
                if (!_YearZeroRollManager.GAMES.includes(CONFIG.YZUR.game)) throw new GameTypeError2("YZUR | Unregistered game. Please register a game before registering a custom die.");
                let cls = _YearZeroRollManager.createDieClass(data);
                CONFIG.YZUR.Dice.DIE_TERMS[term], CONFIG.YZUR.Dice.DIE_TERMS[term] = cls, _YearZeroRollManager.DIE_TERMS_MAP[CONFIG.YZUR.game].push(term), _YearZeroRollManager.registerDie(term)
            }
            static _initialize(yzGame) {
                if (!CONFIG.YZUR) throw new ReferenceError("YZUR | CONFIG.YZUR does not exists!");
                CONFIG.YZUR.game, CONFIG.YZUR.game = yzGame
            }
            static _overrideDiceTermFromData() {
                DiceTerm.prototype.constructor.fromData = function(data) {
                    let cls = CONFIG.Dice.termTypes[data.class];
                    if (!cls) {
                        let termkeys = Object.keys(CONFIG.Dice.terms),
                            stringifiedFaces = String(data.faces);
                        data.class === "Die" && termkeys.includes(stringifiedFaces) ? (cls = CONFIG.Dice.terms[stringifiedFaces], data.class = cls.name) : cls = Object.values(CONFIG.Dice.terms).find(c => c.name === data.class) || foundry.dice.terms.Die
                    }
                    return cls._fromData(data)
                }
            }
            static _overrideRollCreate(index = 1) {
                Roll.prototype.constructor.create = function(formula, data = {}, options = {}) {
                    let n = options.yzur ?? ("game" in data || "maxPush" in data || "game" in options || "maxPush" in options || formula.match(/\d*d(:?[bsngzml]|6|8|10|12)/i)) ? index : 0,
                        cls = CONFIG.Dice.rolls[n];
                    return new cls(formula, data, options)
                }
            }
            static createDieClass(data) {
                if (!data || typeof data != "object") throw new SyntaxError("YZUR | To create a Die class, you must pass a DieClassData object!");
                let {
                    name,
                    denomination: deno,
                    faces,
                    type,
                    lockedValues
                } = data;
                if (typeof faces != "number" || faces <= 0) throw new DieTermError(`YZUR | Invalid die class faces "${faces}"`);
                let YearZeroCustomDie = class extends YearZeroDie {
                    constructor(termData = {}) {
                        termData.faces = faces, super(termData)
                    }
                };
                if (!name | typeof name != "string") throw new DieTermError(`YZUR | Invalid die class name "${name}"`);
                if (Object.defineProperty(YearZeroCustomDie, "name", {
                        value: name
                    }), !deno || typeof deno != "string") throw new DieTermError(`YZUR | Invalid die class denomination "${deno}"`);
                if (YearZeroCustomDie.DENOMINATION = deno, type != null) {
                    if (typeof type != "string") throw new DieTermError(`YZUR | Invalid die class type "${type}"`);
                    CONFIG.YZUR.Dice.DIE_TYPES.includes(type), CONFIG.YZUR.Icons[CONFIG.YZUR.game][type], YearZeroCustomDie.TYPE = type
                }
                if (lockedValues != null) {
                    if (!Array.isArray(lockedValues)) throw new DieTermError(`YZUR | Invalid die class locked values "${lockedValues}" (Not an Array)`);
                    for (let [i, v2] of lockedValues.entries())
                        if (typeof v2 != "number") throw new DieTermError(`YZUR | Invalid die class locked value "${v2}" at [${i}] (Not a Number)`);
                    YearZeroCustomDie.LOCKED_VALUES = lockedValues
                }
                return YearZeroCustomDie
            }
        };
    YearZeroRollManager.DIE_TERMS_MAP = {
        myz: ["base", "skill", "gear", "neg"],
        fbl: ["base", "skill", "gear", "neg", "artoD8", "artoD10", "artoD12"],
        alien: ["skill", "stress"],
        tales: ["skill"],
        cor: ["skill"],
        vae: ["skill"],
        t2k: ["a", "b", "c", "d", "ammo", "loc"],
        br: ["brD12", "brD10", "brD8", "brD6"]
    };
    YearZeroRollManager.GAMES;
    Object.defineProperty(YearZeroRollManager, "GAMES", {
        get: () => Object.keys(YearZeroRollManager.DIE_TERMS_MAP)
    });
    var FBLRollHandler = class _FBLRollHandler extends FormApplication {
        #resolve = args => args;
        #reject = args => args;
        #promise = new Promise((resolve, reject) => {
            this.#resolve = resolve, this.#reject = reject
        });
        constructor({
            attribute = {
                label: localizeString("DICE.BASE"),
                value: 0
            },
            skill = {
                label: localizeString("DICE.SKILL"),
                value: 0
            },
            gear = {
                label: localizeString("DICE.GEAR"),
                value: 0,
                artifactDie: ""
            },
            spell = {}
        }, options = {}) {
            super({}, options), this.base = attribute, this.skill = skill, this.gear = gear, this.damage = options.damage || gear.damage, this.artifact = gear?.artifactDie, this.gears = options.gears || [], this.modifier = options.modifiers?.reduce((sum, mod) => mod.active ? sum + Number(mod.value) : sum, 0) || 0, this.spell = {
                safecast: 0,
                ...spell
            }
        }
        get isAttack() {
            return !!this.damage
        }
        get spellDice() {
            let sum = this.base.value;
            return this.spell.psych && ++sum, this.spell.safecast && (sum -= this.spell.safecast), sum < 0 && (sum = 0), sum
        }
        get powerLevel() {
            let sum;
            return sum = this.spellDice, this.spell.ingredient && ++sum, this.spell.safecast && (sum += this.spell.safecast), sum
        }
        get safecastMax() {
            let psychValue = this.spell.psych ? 1 : 0;
            return this.base.value + psychValue
        }
        get mishapTable() {
            try {
                let tableId = game.settings.get("forbidden-lands", "mishapTables")[this.options.mishapType];
                if (!game.tables.some(t => t.id === tableId)) throw new Error("Table not found.");
                return tableId
            } catch {
                return null
            }
        }
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                classes: ["forbidden-lands"],
                width: "500",
                height: "auto",
                resizable: !0
            })
        }
        get template() {
            return this.options.template || "systems/forbidden-lands/templates/components/roll-engine/dialog.hbs"
        }
        getData(options = {}) {
            return {
                title: this.title,
                dice: {
                    base: this.base,
                    skill: this.skill,
                    gear: this.gear
                },
                artifact: this.artifact,
                modifier: this.modifier,
                safecastMax: this.safecastMax,
                spellDice: this.spellDice,
                powerLevel: this.powerLevel,
                spell: this.spell,
                options
            }
        }
        static getSpeaker({
            actor,
            scene,
            token
        }) {
            return scene && token ? game.scenes.get(scene)?.tokens.get(token)?.actor : game.actors.get(actor)
        }
        activateListeners(html) {
            super.activateListeners(html), html.find("h2 > span[contenteditable]").blur(ev => {
                let value = ev.currentTarget.textContent;
                this.options.title = value, html.parentsUntil("body").find(".window-title").text(value)
            });
            let totalModifierInput = html[0].querySelector("input#modifier"),
                totalGearInput = html[0].querySelector("input#gear"),
                artifactInput = html[0].querySelector("input#artifact");
            html.find("#base").focus(), html.find("input").focus(ev => ev.currentTarget.select()), html.find(".inc-dec-btns").click(ev => {
                let type = $(ev.currentTarget).data("type"),
                    operator = $(ev.currentTarget).data("operator"),
                    input = html.find(`#${type}`),
                    value = Number.parseInt(input.val(), 10) || 0;
                value += operator === "plus" ? 1 : -1, input.val(value > 0 ? value : 0)
            }), html.find("input.option").on("change", function() {
                let artifactRegex = /(\d*d(?:8|10|12))/gi,
                    artifact = this.dataset.value.match(artifactRegex),
                    modifier = {
                        value: this.dataset.value.match(/([+-]\d+(?!d)|^\d+$)/i),
                        item: {
                            id: this.dataset.id,
                            name: this.dataset.name,
                            gearBonus: safeParseJSON(this.dataset.gearBonus)
                        }
                    };
                if (artifact) {
                    let artifacts = artifactInput.value.match(artifactRegex) || [];
                    this.checked ? artifacts.push(artifact[0]) : artifacts.splice(artifacts.indexOf(artifact[0]), 1), artifactInput.value = artifacts.join("+")
                }
                if (modifier.value) {
                    let totalBonusInput = modifier.item.gearBonus ? totalGearInput : totalModifierInput,
                        currentValue = Number(totalBonusInput.value);
                    this.checked ? currentValue += Number(modifier.value[0]) : currentValue -= Number(modifier.value[0]), totalBonusInput.value = currentValue
                }
            }), html.find(".spend-willpower").on("click contextmenu", ev => {
                if (foundry.utils.isEmpty(this.spell)) return;
                let type = this.options.skulls ? "contextmenu" : "click",
                    value = this.base.value;
                ev.type === type && this.spell.willpower.value < this.spell.willpower.max ? (value = Math.max(--value, 1), ++this.spell.willpower.value) : ev.type !== type && this.spell.willpower.value > 0 && (--this.spell.willpower.value, value++), this.base.value = value, this.render(!0)
            }), html.find(".spell-option").on("change", ev => {
                let el = ev.currentTarget;
                switch (el.name) {
                    case "chance":
                        this.spell.safecast = 0;
                    case "psych":
                    case "ingredient":
                        this.spell[el.name] = !!el.checked;
                        break;
                    case "safecast": {
                        this.spell.safecast = Number(el.value);
                        break
                    }
                }
                this.render(!0)
            }), html.find("#cancel").click(() => {
                this.close()
            })
        }
        async _updateObject(event, formData) {
            this._validateForm(event, formData), this.options.type === "spell" ? this._handleRollSpell(formData) : this._handleYZRoll(formData)
        }
        _validateForm(event, formData) {
            let isEmpty = Object.values(formData).every(value => !value),
                invalidArtifactField = !this.constructor.isValidArtifact(formData.artifact);
            if (isEmpty) throw event.target.base.focus(), ui.notifications.warn("WARNING.NO_DICE_INPUT", {
                localize: !0
            }), new Error("No dice input");
            if (invalidArtifactField) throw event.target.artifact.focus(), ui.notifications.error("WARNING.INVALID_ARTIFACT", {
                localize: !0
            }), new Error("Invalid artifact string")
        }
        async _handleRollSpell({
            base,
            power
        }) {
            this.b = {
                term: "b",
                number: base,
                flavor: localizeString(this.base.label)
            }, this.damage = power;
            let actor = _FBLRollHandler.getSpeaker({
                    actor: this.options.actorId,
                    scene: this.options.sceneId,
                    token: this.options.tokenId
                }),
                subtractValue = this.spell.willpower.max + 1 - this.spell.willpower.value;
            await _FBLRollHandler.modifyWillpower(actor, subtractValue, "subtract");
            let result = await this.executeRoll();
            this.#resolve(result)
        }
        async _handleYZRoll({
            base,
            skill,
            gear,
            artifact,
            modifier,
            ...modifierItems
        }) {
            if (Object.values(modifierItems).some(item => item)) {
                let checkedItems = Object.entries(modifierItems).filter(item => item[1]).map(item => item.shift());
                gear = this._getModifierGear(checkedItems, gear)
            }
            this.b = base ? [{
                term: "b",
                number: base,
                flavor: localizeString(this.base.label)
            }] : [], this.g = Array.isArray(gear) ? gear : gear ? [{
                term: "g",
                number: gear,
                flavor: this.gear.label
            }] : [], this.a = this.parseArtifacts(artifact, this.gear.label);
            let diff = skill + modifier;
            switch (!0) {
                case diff < 0:
                    this.n = [{
                        term: "n",
                        number: Math.abs(diff),
                        flavor: localizeString("DICE.NEGATIVE")
                    }];
                    break;
                default:
                    this.s = diff ? [{
                        term: "s",
                        number: diff,
                        flavor: localizeString(this.skill.label)
                    }] : [];
                    break
            }
            this.handleRollArrows();
            let result = await this.executeRoll().catch(err => {
                ui.notifications.error("ERROR.ROLL_FAILED", {
                    localize: !0
                }), this.#reject(err)
            });
            this.#resolve(result)
        }
        _getModifierGear(modifierItemsArray, gear) {
            let modifierGearArray = modifierItemsArray.filter(string => string.startsWith("true")).map(string => {
                let [_2, flavor, value] = string.split("_");
                return {
                    term: "g",
                    flavor,
                    number: Number(value)
                }
            });
            this.gear.value && modifierGearArray.unshift({
                term: "g",
                flavor: this.gear.label,
                number: this.gear.value
            });
            let modTotal = modifierGearArray.reduce((acc, {
                number
            }) => acc + Number(number), 0);
            return Number(gear) - modTotal > 0 && modifierGearArray.push({
                term: "g",
                flavor: localizeString("YZUR.DIETYPES.GearDie"),
                number: Number(gear) - modTotal
            }), modifierGearArray
        }
        #generateTerms() {
            return [this.b, this.s, this.n, this.g, this.a].filter(term => !!term).flat()
        }
        parseArtifacts(string = "", artifactName = "") {
            return string.split(/[+, ]/).filter(term => !!term && term !== "0").reduce((array, artifact) => {
                let [num, term] = artifact.split(/d/i);
                num = Number(num) || 1;
                let existTermIndex = array.findIndex(termVal => termVal[0] === term);
                return existTermIndex > -1 ? array[existTermIndex][1] += num : array.push([term, num]), array
            }, []).map(([term, num]) => ({
                term,
                number: num,
                flavor: artifactName
            }))
        }
        getRollOptions() {
            let maxPush = this.options.unlimitedPush ? 1e4 : this.options.actorType === "monster" ? "0" : 1;
            return {
                name: this.title,
                title: this.title,
                maxPush: this.options.maxPush || maxPush,
                type: this.options.type,
                actorId: this.options.actorId,
                actorType: this.options.actorType,
                alias: this.options.alias,
                attribute: this.base.name,
                chance: this.spell.chance,
                isAttack: this.isAttack,
                consumable: this.options.consumable,
                damage: this.damage,
                tokenId: this.options.tokenId,
                sceneId: this.options.sceneId,
                item: this.gear.name || this.gears.map(gear => gear.name),
                itemId: this.gear.itemId || this.spell?.item?.id || this.gears.map(gear => gear.id),
                willpower: this.options.willpower,
                mishapTable: this.mishapTable,
                mishapType: this.options.mishapType
            }
        }
        async handleRollArrows() {
            let isCharacter = this.options.actorType === "character",
                isRanged = this.gear.category === "ranged",
                isBow = this.gear && (this.gear.name.includes("bow") || this.gear.name.includes("Bow"));
            if (!(isCharacter && isRanged && isBow)) return;
            let actor = this.constructor.getSpeaker({
                actor: this.options.actorId,
                scene: this.options.sceneId,
                token: this.options.tokenId
            });
            if (actor.system.consumable.arrows.value === 0) {
                // Send a message in the chat indicating not enough arrows
                setTimeout(() => {
                    ChatMessage.create({
                        user: game.user.id,
                        speaker: ChatMessage.getSpeaker({
                            actor: actor
                        }),
                        content: `${actor.name} does not have enough arrows!`
                    });
                }, 500);
                return;
            }
            return setTimeout(() => actor.sheet.rollConsumable("arrows"), 500)
        }
        async executeRoll() {
            let roll = FBLRoll.forge(this.#generateTerms(), {
                yzGame: this.options.yzGame,
                maxPush: this.options.maxPush,
                title: this.title
            }, this.getRollOptions());
            return !roll.dice.length && roll.type === "spell" ? (roll._evaluated = !0, {
                roll,
                message: await roll.toMessage()
            }) : (await roll.roll({
                async: !0
            }), {
                roll,
                message: await roll.toMessage()
            })
        }
        async close(options) {
            await super.close(options), options || this.#reject(new Error("Roll cancelled"))
        }
        async render(force = !1, options = {}) {
            return await super.render(force, options), this.#promise
        }
        static isValidArtifact(input) {
            let isEmpty = !input || "0",
                containsArtifactDice = !!input?.match(/(\d*d(?:8|10|12))/i),
                isDiceFormula = !input?.match(/[^\dd+, ]/i);
            return isEmpty || isDiceFormula && containsArtifactDice
        }
        static async createRoll(data = {}, options = {}) {
            return new _FBLRollHandler(data, {
                ...options,
                mishapType: options.type || data.title,
                title: localizeString(data.title) || "ACTION.GENERIC"
            }).render(!0)
        }
        static async pushRoll(msg) {
            let roll = msg.rolls[0];
            await roll.push({
                async: !0
            });
            let speaker = this.getSpeaker(msg.speaker);
            return speaker && await this.updateActor(roll, speaker), roll.toMessage()
        }
        static async updateActor(roll, speaker) {
            roll.options.characterDamage || (roll.options.characterDamage = {
                gear: 0,
                attribute: 0
            }), roll.gearDamage && await this.applyGearDamage(roll, speaker), roll.attributeTrauma && await this.applyAttributDamage(roll, speaker), roll.options.characterDamage = {
                gear: roll.gearDamage || 0,
                attribute: roll.attributeTrauma || 0
            }
        }
        static async applyAttributDamage({
            attributeTrauma,
            options: {
                attribute,
                characterDamage
            }
        }, speaker) {
            let {
                attribute: appliedDamage
            } = characterDamage, currentDamage = attributeTrauma - appliedDamage, value = speaker?.attributes[attribute]?.value;
            value && (await this.modifyWillpower(speaker, currentDamage), value = Math.max(value - currentDamage, 0), value === 0 && ui.notifications.notify("NOTIFY.YOU_ARE_BROKEN", {
                localize: !0
            }), await speaker.update({
                [`system.attribute.${attribute}.value`]: value
            }))
        }
        static async applyGearDamage({
            gearDamageByName
        }, speaker) {
            let gear = speaker?.items.contents.sort((_2, b3) => b3.state === "equipped" ? 1 : -1),
                items = Object.keys(gearDamageByName).map(itemName => gear.find(g2 => g2.name === itemName)).filter(e => !!e);
            if (!items.length) return;
            let updatedItems = items.map(item => {
                let value = Math.max(item.bonus - gearDamageByName[item.name], 0);
                return value === 0 && ui.notifications.notify("NOTIFY.YOUR_ITEM_BROKE", {
                    localize: !0
                }), {
                    _id: item.id,
                    "system.bonus.value": value
                }
            });
            await speaker.updateEmbeddedDocuments("Item", updatedItems)
        }
        static async modifyWillpower(speaker, value, operation = "add") {
            let willpower = speaker.willpower;
            if (willpower) {
                if (operation === "subtract") {
                    willpower = Math.max(willpower.value - value, 0);
                    await speaker.update({
                        "system.bio.willpower.value": willpower
                    });
                }
            }
        }
        static async decreaseConsumable(messageId, number) {
            let {
                system: {
                    speaker
                },
                roll: {
                    options: {
                        consumable
                    }
                }
            } = game.messages.get(messageId);
            if (speaker = this.getSpeaker(speaker), !speaker) return;
            let currentValue = speaker?.consumables[consumable]?.value,
                newValue = Math.max(currentValue - number, 0);
            return await speaker.update({
                [`system.consumable.${consumable}.value`]: newValue
            })
        }
    };
    YearZeroRollManager.registerRoll = (cls = FBLRoll, i = 1) => {
        CONFIG.Dice.rolls[i] = cls, CONFIG.Dice.rolls[i].CHAT_TEMPLATE = CONFIG.YZUR.ROLL.chatTemplate, CONFIG.Dice.rolls[i].TOOLTIP_TEMPLATE = CONFIG.YZUR.ROLL.tooltipTemplate, CONFIG.YZUR.ROLL.index = i
    };
    var FBLRoll = class extends YearZeroRoll {
        constructor(formula, data = {}, options = {}) {
            super(formula, data, options), this.type = options.type || "yz"
        }
        get isOwner() {
            return game.actors.get(this.options.actorId)?.isOwner || null
        }
        get damage() {
            let modifier = this.type === "spell" ? 0 : -1;
            return (this.options.damage || 0) + Math.max(this.successCount + modifier, 0)
        }
        get gearDamageByName() {
            return this.getTerms("gear").reduce((obj, term) => (obj[term.flavor] = term.failure, obj), {})
        }
        get mishapTable() {
            return this.options.mishapTable || null
        }
        get isMishap() {
            let spellMishap = this.options.mishapType === "spell" && (this.baneCount > 0 || this.options.chance),
                mishap = this.options.mishapType !== "spell" && this.options.mishapTable && this.successCount === 0;
            return spellMishap || mishap
        }
        get mishapType() {
            return this.options.mishapType || null
        }
        static create(formula, data = {}, options = {}) {
            return new this(formula, data, options)
        }
        static forge(dice = [], {
            title,
            yzGame = null,
            maxPush = 1
        } = {}, options = {}) {
            if (yzGame = yzGame ?? options.game ?? CONFIG.YZUR?.game, !YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);
            if (!Array.isArray(dice) && typeof dice == "object" && !Object.keys(dice).includes("term")) {
                let _dice = [];
                for (let [term, n] of Object.entries(dice)) {
                    if (n <= 0) continue;
                    let deno = CONFIG.YZUR.Dice.DIE_TERMS[term].DENOMINATION;
                    deno = CONFIG.Dice.terms[deno].DENOMINATION, _dice.push({
                        term: deno,
                        number: n
                    })
                }
                dice = _dice
            }
            Array.isArray(dice) || (dice = [dice]);
            let out = [];
            for (let d of dice) out.push(YearZeroRoll._getTermFormulaFromBlok(d));
            let formula = out.join(" + ");
            if (!YearZeroRoll.validate(formula)) throw ui.notifications.error("ERROR.INVALID_FORMULA", {
                localize: !0
            }), new Error(`Invalid roll formula: ${formula}`);
            options.name === void 0 && (options.name = title), options.game === void 0 && (options.game = yzGame), options.maxPush === void 0 && (options.maxPush = maxPush);
            let roll = this.create(formula, {}, options);
            return CONFIG.debug.dice, roll
        }
        getRollInfos(template = null) {
            template = template ?? CONFIG.YZUR?.ROLL?.infosTemplate;
            let context = {
                roll: this,
                attributeLabel: localizeString(this.options.attribute),
                gears: Object.entries(this.gearDamageByName).map(gear => ({
                    name: localizeString(gear[0]),
                    value: gear[1]
                }))
            };
            return renderTemplate(template, context)
        }
        async toMessage(messageData = {}, {
            rollMode = null,
            create = !0
        } = {}) {
            let speaker = {
                alias: this.options.alias,
                actor: this.options.actorId,
                token: this.options.tokenId,
                scene: this.options.sceneId
            };
            return messageData = foundry.utils.mergeObject({
                user: game.user.id,
                flavor: this.flavor,
                speaker,
                content: this.total,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL
            }, messageData), await super.toMessage(messageData, {
                rollMode,
                create
            })
        }
    };
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();

    function objectSearch(object, string) {
        if (!validateObject(object) || !validateString(string)) return;
        let result = Object.entries(object).find(entries => entries[1] === string);
        return result ? result[0] : null
    }

    function validateObject(object) {
        return !!object && typeof object == "object" && !foundry.utils.isEmpty(object)
    }

    function validateString(string) {
        return !!string && typeof string == "string"
    }
    var ForbiddenLandsItem = class extends Item {
        get ammo() {
            return this.itemProperties.ammo
        }
        get artifactDie() {
            return this.itemProperties.artifactBonus
        }
        get bonus() {
            return this.itemProperties.bonus?.value
        }
        get damage() {
            return this.itemProperties.damage
        }
        get category() {
            return this.itemProperties.category
        }
        get itemProperties() {
            return this.system
        }
        get isBroken() {
            return this.bonus <= 0 && this.itemProperties.bonus.max > 0
        }
        get parryPenalty() {
            return this.category === "melee" && !this.itemProperties.features?.parrying && !this.itemProperties.features?.shield ? CONFIG.fbl.actionModifiers.parry : 0
        }
        get range() {
            return this.itemProperties.range
        }
        get rollModifiers() {
            return this.itemProperties.rollModifiers
        }
        get state() {
            return this.getFlag("forbidden-lands", "state") || ""
        }
        getRollData() {
            return {
                ammo: this.ammo,
                artifactDie: this.artifactDie,
                value: this.bonus || 0,
                category: this.category,
                damage: this.damage || 0,
                isBroken: this.isBroken,
                itemId: this.id,
                label: this.name,
                name: this.name,
                range: this.range,
                type: this.type
            }
        }
        getRollModifier(...rollIdentifiers) {
            if (foundry.utils.getType(this.rollModifiers) !== "Object") return;
            let modifiers = Object.values(this.rollModifiers).reduce((array, mod) => {
                let match = rollIdentifiers.includes(objectSearch(CONFIG.fbl.i18n, mod.name)),
                    state = this.getFlag("forbidden-lands", "state"),
                    isCarriedOrTalent = state === "equipped" || state === "carried" || !CONFIG.fbl.carriedItemTypes.includes(this.type);
                if (match && isCarriedOrTalent) {
                    let value;
                    mod.gearBonus ? value = Number(this.bonus) : mod.value.match(/\d*d(?:8|10|12)/i) ? value = mod.value.replace(/^\+/, "") : value = Number(mod.value), value && array.push({
                        name: this.name,
                        value: typeof value == "number" ? value.toFixed() : value,
                        id: this.id,
                        type: this.type,
                        gearBonus: mod.gearBonus,
                        active: value < 0
                    })
                }
                return array
            }, []);
            return rollIdentifiers.includes("parry") && rollIdentifiers.includes(this.id) && (this.parryPenalty && modifiers.push({
                name: localizeString("WEAPON.FEATURES.PARRYING"),
                value: this.parryPenalty,
                active: !0
            }), this.itemProperties.features?.shield ? modifiers.push({
                name: localizeString("ROLL.PARRY_NON_SLASH"),
                value: 2
            }) : (modifiers.push({
                name: localizeString("ROLL.PARRY_STAB"),
                value: -2
            }), modifiers.push({
                name: localizeString("ROLL.PARRY_PUNCH"),
                value: 2
            }))), modifiers
        }
        async sendToChat() {
            let itemData = this.toObject();
            itemData.img.includes("/mystery-man") && (itemData.img = null), CONFIG.fbl.itemTypes.includes(itemData.type) && (itemData[`is${itemData.type.capitalize()}`] = !0), itemData.showField = {};
            for (let field of ["Appearance", "Description", "Drawback", "Effect"]) itemData.system[field.toLowerCase()] && !this.getFlag("forbidden-lands", field) && (itemData.showField[field.toLowerCase()] = !0);
            itemData.hasRollModifiers = itemData.system.rollModifiers && Object.values(itemData.system.rollModifiers).filter(mod => !mod.gearBonus).length > 0;
            let html = await renderTemplate("systems/forbidden-lands/templates/components/item-chatcard.hbs", itemData),
                chatData = {
                    user: game.userId,
                    rollMode: game.settings.get("core", "rollMode"),
                    content: html
                };
            ["gmroll", "blindroll"].includes(chatData.rollMode) ? chatData.whisper = ChatMessage.getWhisperRecipients("GM") : chatData.rollMode === "selfroll" && (chatData.whisper = [game.user]);
            let message = await ChatMessage.create(chatData);
            if (itemData.isCriticalInjury) {
                let content = $(message.system.content),
                    limit = content.find("[data-type='limit']").text().trim(),
                    healingTime = content.find("[data-type='healtime']").text().trim();
                itemData.system.limit = limit, itemData.system.healingTime = healingTime
            }
            await message.setFlag("forbidden-lands", "itemData", itemData)
        }
        static async create(data, options) {
            if (!data.img) switch (data.type) {
                case "building":
                    data.img = "icons/svg/castle.svg";
                    break
            }
            return super.create(data, options)
        }
    };
    init_define_GLOBALPATHS();
    var ALL_TABLES = {},
        getTables = async (path, fileName) => (fileName = fileName.replace("_rooms", ""), await fetch(`modules/${path}/manifests/${fileName}.json`).then(res => res.json()).catch(err => {
            throw ui.notifications.error("Error fetching tables."), new Error(`Error fetching tables: ${err}`)
        })), getNumber = string => {
            switch (!0) {
                case /one/i.test(string):
                    return 1;
                case /two/i.test(string):
                    return 2;
                case /three/i.test(string):
                    return 3;
                case /four/i.test(string):
                    return 4;
                case /five/i.test(string):
                    return 5;
                default:
                    return 0
            }
        }, cheapRoll = roll => {
            let [dice, sides, modifier] = roll.split(/d|\+/i);
            dice = Number.parseInt(dice) || 1, sides = Number.parseInt(sides) || 6, modifier = modifier ? Number.parseInt(modifier) : 0;
            let result = 0;
            for (let i = 0; i <= dice; i++) result += Math.floor(Math.random() * sides) + 1;
            return result + modifier
        }, inlineRolls = text => {
            let regex = /\[\[(.*?)\]\]/g;
            return text.replace(regex, (_2, match) => cheapRoll(match))
        }, parseReRolls = result => {
            for (let value of Object.values(result))
                if (typeof value == "string") {
                    let parsedResults = value.split(":");
                    if (parsedResults[0] === "reroll") return Number.parseInt(parsedResults[1])
                } return 0
        }, parseStrings = result => Object.entries(result).reduce((obj, [key, value]) => {
            if (typeof value == "string") {
                let randomizedString = string => {
                    let array = string.split("|").map(entry => entry.split(":")).reduce((arr, [num, entry]) => {
                        for (let i = 0; i < num; i++) arr.push(entry);
                        return arr
                    }, []);
                    return array[Math.floor(Math.random() * array.length)]
                };
                obj[key] = value.replace(/\{\{(.*?)\}\}/g, (_2, p1) => randomizedString(p1))
            } else obj[key] = value;
            return obj
        }, {}), parseRollStrings = results => {
            let parsedResults = results.split(":");
            return parsedResults.length === 3 ? rollOnTable(ALL_TABLES[parsedResults[2]], fns("all_results"), Number.parseInt(parsedResults[1])) : []
        }, fns = type => {
            let types = {
                all_results: results => results.map(result => parseStrings(result)),
                some_results: (results, variable = "None") => results.filter(result => !Object.values(result).some(value => typeof value == "string" && value.match(variable))),
                hybrid: results => Math.random() < 1 / results.length ? [results[0]] : [results.reduce((obj, cur, i) => (cur = Object.entries(cur), obj[cur[i][0]] = cur[i][1], obj), {})],
                inn_name_string: results => Math.random() > .5 ? [{
                    the_name_of_the_inn: `The ${results[0].first_word} ${results[1].second_word}`
                }] : [{
                    the_name_of_the_inn: `The ${results[0].second_word} & ${results[0].second_word}`
                }]
            };
            return types[type] ?? types.all_results
        }, getRolledData = adventureSite => {
            let tablesToRoll = CONFIG.fbl.adventureSites.tables[adventureSite],
                results = {};
            for (let {
                    name: tableName,
                    type,
                    roll
                }
                of tablesToRoll) {
                let rollCount = roll ?? 1,
                    table = ALL_TABLES[tableName],
                    result = rollOnTable(table, fns(type), rollCount);
                results[tableName] = result, ALL_TABLES[`${tableName}_description`] && (results[`${tableName}_description`] = ALL_TABLES[`${tableName}_description`])
            }
            return results
        }, rollOnTable = (table, fn, count = 1, modifier = 0) => {
            let results = [];
            for (let i = 0; i < count; i++) {
                let resultCount = 0,
                    dieRoll = Math.floor(Math.random() * table.reduce((acc, cur) => acc + cur.weight, 0) + modifier + 1);
                for (let result of table)
                    if (resultCount += result.weight, dieRoll <= resultCount) {
                        let rerolls = parseReRolls(result);
                        count += rerolls, rerolls === 0 && results.push(result);
                        break
                    }
            }
            return fn(results, table)
        }, moldData = (data, type) => (CONFIG.fbl.adventureSites?.transformers?.[type] ?? ((d, _2) => d))(data, ALL_TABLES), init = async (path, adventureSite) => {
            if (!Object.keys(CONFIG.fbl.adventureSites.types).includes(adventureSite.replace("_rooms", ""))) return "";
            ALL_TABLES = await getTables(path, adventureSite);
            let data = getRolledData(adventureSite);
            data = moldData(data, adventureSite);
            let html = await renderTemplate(`modules/${path}/templates/${adventureSite}.hbs`, data);
            return inlineRolls(html)
        }, utilities = {
            inlineRolls,
            parseRollStrings,
            parseStrings,
            parseReRolls,
            rollOnTable,
            getRolledData,
            getNumber,
            cheapRoll,
            fns
        };
    init_define_GLOBALPATHS();
    var ForbiddenLandsJournalEntry = class extends JournalEntry {
        static async create(data, options) {
            if (!data.type || data.type === "base") return super.create(data, options);
            data.flags = {
                "forbidden-lands": {
                    type: data.type
                }
            };
            let path = CONFIG.fbl.adventureSites?.types[data.type],
                content = await CONFIG.fbl.adventureSites?.generate(path, data.type);
            return data.pages = [{
                name: "Overview",
                title: {
                    show: !1
                },
                text: {
                    content
                }
            }], super.create(data, options)
        }
        get type() {
            let type = this.getFlag("forbidden-lands", "type");
            return type || CONST.BASE_DOCUMENT_TYPE
        }
        static async createDialog(data = {}, {
            parentFolder = null,
            pack = null,
            ...options
        } = {}) {
            let documentName = this.metadata.name,
                types = game.documentTypes[documentName],
                folders = [];
            parentFolder || (pack ? folders = game.packs.get(pack).folders.contents : folders = game.folders.filter(f3 => f3.type === documentName && f3.displayed));
            let label = game.i18n.localize(this.metadata.label),
                title = game.i18n.format("DOCUMENT.Create", {
                    type: label
                }),
                html = await renderTemplate("templates/sidebar/document-create.html", {
                    folders,
                    name: data.name || game.i18n.format("DOCUMENT.New", {
                        type: label
                    }),
                    folder: data.folder,
                    hasFolders: folders.length >= 1,
                    type: data.type || CONFIG[documentName]?.defaultType || types[0],
                    types: types.reduce((obj, t) => {
                        let typeLabel = CONFIG[documentName]?.typeLabels?.[t] ?? t;
                        return obj[t] = game.i18n.has(typeLabel) ? game.i18n.localize(typeLabel) : t, obj
                    }, {}),
                    hasTypes: types.length > 1
                });
            return Dialog.prompt({
                title,
                content: html,
                label: title,
                callback: JQhtml => {
                    let form = JQhtml[0].querySelector("form"),
                        fd = new FormDataExtended(form);
                    return foundry.utils.mergeObject(data, fd.object, {
                        inplace: !0
                    }), data.folder || (data.folder = void 0), types.length === 1 && (data.type = types[0]), data.name?.trim() || (data.name = this.defaultName()), this.create(data, {
                        parent: parentFolder,
                        pack,
                        renderSheet: !0
                    })
                },
                rejectClose: !1,
                options
            })
        }
    };
    init_define_GLOBALPATHS();
    var FBL = {
            actionSkillMap: {
                slash: "melee",
                stab: "melee",
                unarmed: "melee",
                grapple: "melee",
                "break-free": "melee",
                melee: "melee",
                ranged: "marksmanship",
                shoot: "marksmanship",
                persuade: "manipulation",
                taunt: "performance",
                flee: "move",
                heal: "heal",
                dodge: "move",
                parry: "melee",
                shove: "melee",
                disarm: "melee",
                run: "move",
                retreat: "move",
                "grapple-attack": "melee",
                "travel-forced-march": "endurance",
                "travel-hike-in-darkness": "scouting",
                "travel-navigate": "survival",
                "travel-sea-travel": "survival",
                "travel-keep-watch": "scouting",
                "travel-find-good-place": "survival",
                "travel-find-food": "survival",
                "travel-survey": "scouting",
                "travel-wood": "crafting",
                "travel-cook": "crafting",
                "travel-crafting": "crafting",
                "travel-find-prey": "survival",
                "travel-kill-prey": "survival",
                "travel-catch-fish": "survival",
                "travel-make-camp": "survival"
            },
            actionModifiers: {
                parry: -2
            },
            adventureSites: {
                tables: {},
                transformers: {},
                types: {},
                utilities: {},
                generate: async (_path, _type) => {}
            },
            attributes: ["agility", "empathy", "strength", "wits"],
            carriedStates: ["equipped", "carried"],
            carriedItemTypes: ["armor", "gear", "rawMaterial", "weapon"],
            characterSubtype: {
                pc: "ACTOR.SUBTYPE.PC",
                npc: "ACTOR.SUBTYPE.NPC"
            },
            consumableDice: {
                1: "1db",
                2: "1db",
                3: "2db",
                4: "3db"
            },
            consumableDiceTorches: {
                1: "1db",
                2: "1d8",
                3: "1d10",
                4: "1d12"
            },
            conditions: ["cold", "hungry", "sleepy", "thirsty"],
            dataSetConfig: {
                en: "dataset",
                "pt-BR": "dataset-pt-br",
                es: "dataset-es",
                fr: "dataset-fr",
                de: "dataset-de"
            },
            encumbrance: {
                tiny: 0,
                none: 0,
                light: .5,
                regular: 1,
                heavy: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8
            },
            enrichedActorFields: ["note", "pride", "face", "body", "clothing", "darkSecret"],
            enrichedItemFields: ["description", "effect", "drawback", "appearance", "tools", "features.others"],
            i18n: {
                armor: "ITEM.TypeArmor",
                gear: "ITEM.TypeGear",
                weapon: "ITEM.TypeWeapon",
                rawMaterial: "ITEM.TypeRawmaterial",
                talent: "ITEM.TypeTalent",
                spell: "ITEM.TypeSpell",
                monsterAttack: "ITEM.TypeMonsterattack",
                criticalInjury: "ITEM.TypeCriticalinjury",
                building: "ITEM.TypeBuilding",
                hireling: "ITEM.TypeHireling",
                agility: "ATTRIBUTE.AGILITY",
                empathy: "ATTRIBUTE.EMPATHY",
                strength: "ATTRIBUTE.STRENGTH",
                wits: "ATTRIBUTE.WITS",
                "animal-handling": "SKILL.ANIMAL_HANDLING",
                crafting: "SKILL.CRAFTING",
                endurance: "SKILL.ENDURANCE",
                healing: "SKILL.HEALING",
                insight: "SKILL.INSIGHT",
                lore: "SKILL.LORE",
                manipulation: "SKILL.MANIPULATION",
                marksmanship: "SKILL.MARKSMANSHIP",
                melee: "SKILL.MELEE",
                might: "SKILL.MIGHT",
                move: "SKILL.MOVE",
                performance: "SKILL.PERFORMANCE",
                scouting: "SKILL.SCOUTING",
                "sleight-of-hand": "SKILL.SLEIGHT_OF_HAND",
                stealth: "SKILL.STEALTH",
                survival: "SKILL.SURVIVAL",
                slash: "ACTION.SLASH",
                stab: "ACTION.STAB",
                unarmed: "ACTION.UNARMED_STRIKE",
                grapple: "ACTION.GRAPPLE",
                "break-free": "ACTION.BREAK_FREE",
                ranged: "WEAPON.RANGED",
                shoot: "ACTION.SHOOT",
                persuade: "ACTION.PERSUADE",
                taunt: "ACTION.TAUNT",
                flee: "ACTION.FLEE",
                heal: "ACTION.HEAL",
                dodge: "ACTION.DODGE",
                parry: "ACTION.PARRY",
                shove: "ACTION.SHOVE",
                disarm: "ACTION.DISARM",
                run: "ACTION.RUN",
                retreat: "ACTION.RETREAT",
                "grapple-attack": "ACTION.GRAPPLE_ATTACK",
                spells: "MAGIC.SPELLS",
                activatedTalents: "TALENT.ANY_ACTIVATED",
                "travel-forced-march": "FLPS.TRAVEL_ROLL.FORCED_MARCH",
                "travel-navigate": "FLPS.TRAVEL_ROLL.NAVIGATE",
                "travel-sea-travel": "FLPS.TRAVEL_ROLL.SEA_TRAVEL",
                "travel-keep-watch": "FLPS.TRAVEL_ROLL.KEEP_WATCH",
                "travel-survey": "FLPS.TRAVEL_ROLL.SURVEY",
                "travel-wood": "FLPS.TRAVEL_ROLL.WOOD",
                "travel-cook": "FLPS.TRAVEL_ROLL.COOK",
                "travel-crafting": "FLPS.TRAVEL_ROLL.CRAFTING",
                "travel-find-good-place": "FLPS.TRAVEL_ROLL.FIND_GOOD_PLACE",
                "travel-find-food": "FLPS.TRAVEL_ROLL.FIND_FOOD",
                "travel-find-prey": "FLPS.TRAVEL_ROLL.FIND_PREY",
                "travel-hike-in-darkness": "FLPS.TRAVEL_ROLL.HIKE_IN_DARKNESS",
                "travel-kill-prey": "FLPS.TRAVEL_ROLL.KILL_PREY",
                "travel-catch-fish": "FLPS.TRAVEL_ROLL.CATCH_FISH",
                "travel-make-camp": "FLPS.TRAVEL_ROLL.MAKE_CAMP",
                carryingCapacity: "CARRYING_CAPACITY",
                "dark-forest": "BIOME.DARK_FOREST",
                forest: "BIOME.FOREST",
                hills: "BIOME.HILLS",
                lake: "BIOME.LAKE",
                marshlands: "BIOME.MARSHLANDS",
                mountains: "BIOME.MOUNTAINS",
                plains: "BIOME.PLAINS",
                quagmire: "BIOME.QUAGMIRE",
                ruins: "BIOME.RUINS",
                "beneath-the-ice": "BIOME.BENEATH_THE_ICE",
                "ice-cap": "BIOME.ICE_CAP",
                "ice-forest": "BIOME.ICE_FOREST",
                "sea-ice": "BIOME.SEA_ICE",
                tundra: "BIOME.TUNDRA",
                "crimson-forest": "BIOME.CRIMSON_FOREST",
                ashlands: "BIOME.ASHLANDS",
                ocean: "BIOME.OCEAN",
                firelands: "BIOME.FIRELANDS"
            },
            itemTypes: ["armor", "building", "criticalInjury", "gear", "hireling", "monsterAttack", "rawMaterial", "spell", "talent", "weapon"],
            maxInit: 10,
            mishapTables: ["travel-make-camp", "travel-catch-fish", "travel-find-food", "travel-find-prey", "travel-navigate", "travel-sea-travel", "spell"],
            encounterTables: ["dark-forest", "forest", "hills", "lake", "marshlands", "mountains", "plains", "quagmire", "ruins", "beneath-the-ice", "ice-cap", "ice-forest", "sea-ice", "tundra", "ocean", "firelands", "crimson-forest", "ashlands"],
            otherTables: ["travel-find-prey"],
            prideDice: "1d12",
            skillAttributeMap: {
                "animal-handling": "empathy",
                crafting: "strength",
                endurance: "strength",
                healing: "empathy",
                insight: "wits",
                lore: "wits",
                manipulation: "empathy",
                marksmanship: "agility",
                melee: "strength",
                might: "strength",
                move: "agility",
                performance: "empathy",
                scouting: "wits",
                "sleight-of-hand": "agility",
                stealth: "agility",
                survival: "wits"
            },
            statusEffects: [{
                id: "sleepy",
                icon: "icons/svg/sleep.svg",
                label: "CONDITION.SLEEPY",
                changes: [{
                    key: "system.condition.sleepy.value",
                    mode: 5,
                    value: !0
                }],
                statuses: ["sleepy"]
            }, {
                id: "thirsty",
                icon: "icons/svg/tankard.svg",
                label: "CONDITION.THIRSTY",
                changes: [{
                    key: "system.condition.thirsty.value",
                    mode: 5,
                    value: !0
                }],
                statuses: ["thirsty"]
            }, {
                id: "hungry",
                icon: "icons/svg/sun.svg",
                label: "CONDITION.HUNGRY",
                changes: [{
                    key: "system.condition.hungry.value",
                    mode: 5,
                    value: !0
                }],
                statuses: ["hungry"]
            }, {
                id: "cold",
                icon: "icons/svg/frozen.svg",
                label: "CONDITION.COLD",
                changes: [{
                    key: "system.condition.cold.value",
                    mode: 5,
                    value: !0
                }],
                statuses: ["cold"]
            }],
            weaponFeatures: ["blunt", "edged", "hook", "parrying", "shield", "pointed", "slowReload"]
        },
        modifyConfig = () => {
            let settings = ["maxInit"];
            for (let setting of settings) {
                let value = game.settings.get("forbidden-lands", setting);
                value && (FBL[setting] = value)
            }
        },
        config_default = FBL;
    init_define_GLOBALPATHS();

    function initializeEditorEnrichers() {
        CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([{
            pattern: /\$big\[(.+?)\]/gim,
            enricher: async match => {
                let doc = document.createElement("span");
                return doc.className = "big-first-char", doc.innerHTML = match[1], doc
            }
        }, {
            pattern: /\[(x)\]/gim,
            enricher: async match => {
                let doc = document.createElement("span");
                return doc.className = "fbl-swords", doc.innerHTML = match[1], doc
            }
        }, {
            pattern: /\[(l)\]/gim,
            enricher: async match => {
                let doc = document.createElement("span");
                return doc.className = "fbl-skull", doc.innerHTML = match[1], doc
            }
        }, {
            pattern: /\$branded\[(.+?)\]/gim,
            enricher: async match => {
                let doc = document.createElement("span");
                return doc.className = "fbl-branding-bold", doc.innerHTML = match[1], doc
            }
        }, {
            pattern: /\$capital\[(.+?)\]/gim,
            enricher: async match => {
                let doc = document.createElement("span");
                return doc.className = "fbl-uppercase", doc.innerHTML = match[1], doc
            }
        }, {
            pattern: /\$example\[(.+?)\]/gim,
            enricher: async match => {
                let doc = document.createElement("span");
                return doc.className = "fbl-example", doc.innerHTML = match[1], doc
            }
        }, {
            pattern: /\$iheading\[(.+?)\]/gim,
            enricher: async match => {
                let doc = document.createElement("span");
                return doc.className = "fbl-uppercase fbl-inline-heading", doc.innerHTML = match[1], doc
            }
        }, {
            pattern: /@Draw\[(.+?)\]/gim,
            enricher: async match => {
                let table = game.tables.get(match[1]) ?? game.tables.getName(match[1]),
                    html = table ? `<a
					class="inline-table"
					data-id="${table.id}"
					onclick="game.tables.get('${table.id}').draw();"
					data-tooltip="${localizeString("TABLE.DRAW")} ${table.name}"
					><i class="fas fa-cards" ></i>${table.name}</a>
				` : `<span class="broken"><i class="fas fa-broken"></i>${match[1]}</span>`;
                return $(html)[0]
            }
        }, {
            pattern: /@ToggleScene\[(.+?)\]/gim,
            enricher: async match => {
                let scene = game.scenes.get(match[1]) ?? game.scenes.getName(match[1]),
                    html = scene ? `<a
					class="inline-scene"
					data-id="${scene.id}"
					onclick="game.scenes.get('${scene.id}').view();"
					data-tooltip="${localizeString("SCENE.RENDER")} ${scene.name}"
					><i class="fas fa-map" ></i>${scene.name}</a>
				` : `<span class="broken"><i class="fas fa-broken"></i>${match[1]}</span>`;
                return $(html)[0]
            }
        }, {
            pattern: fblrRegEx,
            enricher: fblrEnricher
        }]), document.querySelector("body").addEventListener("click", async event => {
            if (event.target.closest(".fblroll")) return event.preventDefault(), event.stopPropagation(), fblrListener(event)
        })
    }
    var fblrRegEx = /\[\[\/fblr (?:(\d+)db\s?)?(?:(\d+)ds\s?)?(?:(\d+)dg\s?)?(?:1d(6|8|10|12)\s?)?(?:([+|-]\d+)\s?)?(\d)?\]\](?:{([^}]+)})?/gi;

    function fblrEnricher(match) {
        let span = document.createElement("span");
        span.classList.add("fas"), span.classList.add("fa-dice-d20");
        let button = document.createElement("button");
        return button.type = "button", button.classList.add("fblroll"), button.classList.add("roll"), button.classList.add("inline-roll"), button.dataset.fblBase = match[1] || 1, button.dataset.fblSkill = match[2] || 0, button.dataset.fblGear = match[3] || 0, button.dataset.fblArtifact = match[4] || "", button.dataset.fblModifier = match[5] || "", button.dataset.fblDamage = match[6] || "", button.innerHTML = match[7] || localizeString("ACTION.GENERIC"), button.prepend(span), button
    }

    function fblrListener(event) {
        let button = event.target,
            data = {
                attribute: {
                    label: "DICE.BASE",
                    value: button.dataset.fblBase
                },
                skill: {
                    label: "DICE.SKILL",
                    value: button.dataset.fblSkill
                },
                gear: {
                    label: "DICE.GEAR",
                    value: button.dataset.fblGear,
                    artifactDie: button.dataset.fblArtifact ? `1d${button.dataset.fblArtifact}` : "",
                    damage: Number(button.dataset.fblDamage)
                }
            },
            options = {};
        return button.dataset.fblModifier && (options.modifiers = [{
            name: localizeString("DICE.MODIFIER"),
            value: button.dataset.fblModifier,
            active: !0
        }]), game.fbl.roll(data, options).catch(error => {})
    }
    init_define_GLOBALPATHS();

    function registerFonts() {
        CONFIG.fontDefinitions.Author = {
            editor: !0,
            fonts: [{
                urls: ["systems/forbidden-lands/fonts/author-semibold.otf"],
                weight: 600
            }, {
                urls: ["systems/forbidden-lands/fonts/author-semibold-italic.otf"],
                weight: 600,
                style: "italic"
            }, {
                urls: ["systems/forbidden-lands/fonts/author-medium.otf"]
            }, {
                urls: ["systems/forbidden-lands/fonts/author-medium-italic.otf"],
                style: "italic"
            }]
        }, CONFIG.fontDefinitions["IM Fell Great Primer"] = {
            editor: !0,
            fonts: [{
                urls: ["systems/forbidden-lands/fonts/imfe-gprm.otf"]
            }, {
                urls: ["systems/forbidden-lands/fonts/imfe-gpit.otf"],
                style: "italic"
            }]
        }
    }
    init_define_GLOBALPATHS();
    async function FoundryOverrides() {
        return new Promise(resolve => resolve())
    }
    init_define_GLOBALPATHS();

    function preloadHandlebarsTemplates() {
        let templatePaths = define_GLOBALPATHS_default;
        return loadTemplates(templatePaths)
    }

    function registerHandlebarsHelpers() {
        Handlebars.registerHelper("skulls", function(current, max, block) {
            let acc = "";
            for (let i = 0; i < max; ++i) block.data.index = i, block.data.damaged = i >= current, acc += block.fn(this);
            return acc
        }), Handlebars.registerHelper("flps_capitalize", value => typeof value == "string" && value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value), Handlebars.registerHelper("flps_strconcat", (...args) => (args.pop(), args.join(""))), Handlebars.registerHelper("damageType", type => {
            switch (type = normalize(type, "blunt"), type) {
                case "blunt":
                    return game.i18n.localize("ATTACK.BLUNT");
                case "fear":
                    return game.i18n.localize("ATTACK.FEAR");
                case "slash":
                    return game.i18n.localize("ATTACK.SLASH");
                case "stab":
                    return game.i18n.localize("ATTACK.STAB");
                case "other":
                    return game.i18n.localize("ATTACK.OTHER")
            }
        }), Handlebars.registerHelper("armorPart", part => {
            switch (part = normalize(part, "body"), part) {
                case "body":
                    return game.i18n.localize("ARMOR.BODY");
                case "head":
                    return game.i18n.localize("ARMOR.HELMET");
                case "shield":
                    return game.i18n.localize("ARMOR.SHIELD")
            }
        }), Handlebars.registerHelper("itemWeight", weight => {
            switch (normalize(weight, "regular")) {
                case "none":
                    return game.i18n.localize("WEIGHT.NONE");
                case "tiny":
                    return game.i18n.localize("WEIGHT.TINY");
                case "light":
                    return game.i18n.localize("WEIGHT.LIGHT");
                case "regular":
                    return game.i18n.localize("WEIGHT.REGULAR");
                case "heavy":
                    return game.i18n.localize("WEIGHT.HEAVY");
                default:
                    return weight
            }
        }), Handlebars.registerHelper("weaponCategory", category => {
            switch (category = normalize(category, "melee"), category) {
                case "melee":
                    return game.i18n.localize("WEAPON.MELEE");
                case "ranged":
                    return game.i18n.localize("WEAPON.RANGED")
            }
        }), Handlebars.registerHelper("weaponGrip", grip => {
            switch (grip = normalize(grip, "1h"), grip) {
                case "1h":
                    return game.i18n.localize("WEAPON.1H");
                case "2h":
                    return game.i18n.localize("WEAPON.2H")
            }
        }), Handlebars.registerHelper("weaponRange", range => {
            switch (range = normalize(range, "arm"), range) {
                case "arm":
                    return game.i18n.localize("RANGE.ARM");
                case "near":
                    return game.i18n.localize("RANGE.NEAR");
                case "short":
                    return game.i18n.localize("RANGE.SHORT");
                case "long":
                    return game.i18n.localize("RANGE.LONG");
                case "distant":
                    return game.i18n.localize("RANGE.DISTANT")
            }
        }), Handlebars.registerHelper("talentType", type => {
            switch (type = normalize(type, "general"), type) {
                case "general":
                    return game.i18n.localize("TALENT.GENERAL");
                case "kin":
                    return game.i18n.localize("TALENT.KIN");
                case "profession":
                    return game.i18n.localize("TALENT.PROFESSION")
            }
        }), Handlebars.registerHelper("isBroken", item => Number.parseInt(item.system.bonus.max, 10) > 0 && Number.parseInt(item.system.bonus.value, 10) === 0 ? "broken" : ""), Handlebars.registerHelper("formatRollModifiers", rollModifiers => {
            let output = [];
            return Object.values(rollModifiers).filter(mod => !mod.gearBonus).forEach(mod => {
                let modName = game.i18n.localize(mod.name);
                output.push(`${modName} ${mod.value}`)
            }), output.join(", ")
        }), Handlebars.registerHelper("hasWeaponFeatures", (weaponType, features) => {
            let meleeFeatures = ["edged", "pointed", "blunt", "parry", "hook"],
                rangedFeatures = ["slowReload"];
            if (features.others !== "") return !0;
            let weaponFeatures = [];
            weaponType === "melee" ? weaponFeatures = meleeFeatures : weaponType === "ranged" && (weaponFeatures = rangedFeatures);
            for (let feature in features)
                if (weaponFeatures.includes(feature) && features[feature]) return !0;
            return !1
        }), Handlebars.registerHelper("formatWeaponFeatures", (weaponType, features) => {
            let output = [];
            return weaponType === "melee" ? (features.edged && output.push(game.i18n.localize("WEAPON.FEATURES.EDGED")), features.pointed && output.push(game.i18n.localize("WEAPON.FEATURES.POINTED")), features.blunt && output.push(game.i18n.localize("WEAPON.FEATURES.BLUNT")), features.parrying && output.push(game.i18n.localize("WEAPON.FEATURES.PARRYING")), features.hook && output.push(game.i18n.localize("WEAPON.FEATURES.HOOK"))) : weaponType === "ranged" ? features.slowReload && output.push(game.i18n.localize("WEAPON.FEATURES.SLOW_RELOAD")) : features.others ? output.push(features.others) : features && output.push(features), output.join(", ")
        }), Handlebars.registerHelper("plaintextToHTML", value => new Handlebars.SafeString(value.replace(/(<([^>]+)>)/gi, "").replace(/(?:\r\n|\r|\n)/g, "<br/>"))), Handlebars.registerHelper("toUpperCase", str => str.toUpperCase()), Handlebars.registerHelper("eq", (...args) => (args.pop(), args.every(expression => args[0] === expression))), Handlebars.registerHelper("or", (...args) => (args.pop(), args.reduce((x2, y2) => x2 || y2))), Handlebars.registerHelper("and", (...args) => (args.pop(), args.reduce((x2, y2) => x2 && y2))), Handlebars.registerHelper("chargenLoc", item => {
            let localizedString = CONFIG.fbl.i18n[item];
            return localizedString || (localizedString = `SKILL.${item.toUpperCase().replace(/[\s-]/g,"_")}`), localizedString
        }), Handlebars.registerHelper("getType", item => typeof(Number(item) || item)), Handlebars.registerHelper("randomize", items => items[Math.floor(Math.random() * items.length)]), Handlebars.registerHelper("fblLocalize", (...args) => (args.pop(), localizeString(args.join(".")))), Handlebars.registerHelper("ternary", (conditional, string1, string2) => conditional ? string1 : string2), Handlebars.registerHelper("count", (array = []) => Array.isArray(array) ? array.length : 0), Handlebars.registerHelper("range", (start, end) => Array.from({
            length: 1 + end - start
        }, (_2, i) => i + start))
    }

    function normalize(data, defaultValue) {
        return data ? data.toLowerCase() : defaultValue
    }
    var initializeHandlebars = () => {
        registerHandlebarsHelpers(), preloadHandlebarsTemplates()
    };
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    var k = 1;
    var b = Symbol("Fragment"),
        D = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]),
        x = new Set(["script", "style"]),
        _ = /([\@\.a-z0-9_\:\-]*)\s*?=?\s*?(['"]?)([\s\S]*?)\2\s+/gim,
        o = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:-]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!)([\s\S]*?)(>))/gm;

    function P(e) {
        let t = {},
            a;
        if (e)
            for (_.lastIndex = 0, e = " " + (e || "") + " "; a = _.exec(e);) a[0] !== " " && (t[a[1]] = a[3]);
        return t
    }

    function w(e) {
        let t = typeof e == "string" ? e : e.value,
            a, r, n, i, l, d, g2, h, s, c = [];
        o.lastIndex = 0, r = a = {
            type: 0,
            children: []
        };
        let E2 = 0;

        function m() {
            i = t.substring(E2, o.lastIndex - n[0].length), i && r.children.push({
                type: 2,
                value: i,
                parent: r
            })
        }
        for (; n = o.exec(t);) {
            if (d = n[5] || n[8], g2 = n[6] || n[9], h = n[7] || n[10], x.has(r.name) && n[2] !== r.name) {
                l = o.lastIndex - n[0].length, r.children.length > 0 && (r.children[0].value += n[0]);
                continue
            } else if (d === "<!--") {
                if (l = o.lastIndex - n[0].length, x.has(r.name)) continue;
                s = {
                    type: 3,
                    value: g2,
                    parent: r,
                    loc: [{
                        start: l,
                        end: l + d.length
                    }, {
                        start: o.lastIndex - h.length,
                        end: o.lastIndex
                    }]
                }, c.push(s), s.parent.children.push(s)
            } else if (d === "<!") l = o.lastIndex - n[0].length, s = {
                type: 4,
                value: g2,
                parent: r,
                loc: [{
                    start: l,
                    end: l + d.length
                }, {
                    start: o.lastIndex - h.length,
                    end: o.lastIndex
                }]
            }, c.push(s), s.parent.children.push(s);
            else if (n[1] !== "/")
                if (m(), x.has(r.name)) {
                    E2 = o.lastIndex, m();
                    continue
                } else s = {
                    type: 1,
                    name: n[2] + "",
                    attributes: P(n[3]),
                    parent: r,
                    children: [],
                    loc: [{
                        start: o.lastIndex - n[0].length,
                        end: o.lastIndex
                    }]
                }, c.push(s), s.parent.children.push(s), n[4] && n[4].indexOf("/") > -1 || D.has(s.name) ? (s.loc[1] = s.loc[0], s.isSelfClosingTag = !0) : r = s;
            else m(), n[2] + "" === r.name ? (s = r, r = s.parent, s.loc.push({
                start: o.lastIndex - n[0].length,
                end: o.lastIndex
            }), i = t.substring(s.loc[0].end, s.loc[1].start), s.children.length === 0 && s.children.push({
                type: 2,
                value: i,
                parent: r
            })) : n[2] + "" === c[c.length - 1].name && c[c.length - 1].isSelfClosingTag === !0 && (s = c[c.length - 1], s.loc.push({
                start: o.lastIndex - n[0].length,
                end: o.lastIndex
            }));
            E2 = o.lastIndex
        }
        return i = t.slice(E2), r.children.push({
            type: 2,
            value: i,
            parent: r
        }), a
    }
    var O = class {
            constructor(t) {
                this.callback = t
            }
            visit(t, a, r) {
                if (this.callback(t, a, r), Array.isArray(t.children))
                    for (let n = 0; n < t.children.length; n++) {
                        let i = t.children[n];
                        this.visit(i, t, n)
                    }
            }
        },
        N = Symbol("HTMLString"),
        S = Symbol("AttrString"),
        u = Symbol("RenderFn");

    function p(e, t = [N]) {
        let a = {
            value: e
        };
        for (let r of t) Object.defineProperty(a, r, {
            value: !0,
            enumerable: !1,
            writable: !1
        });
        return a
    }
    var I = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };

    function y(e) {
        return e.replace(/[&<>]/g, t => I[t] || t)
    }

    function f(e) {
        let t = "";
        for (let [a, r] of Object.entries(e)) t += ` ${a}="${r}"`;
        return p(t, [N, S])
    }

    function z(e, t) {
        return new O(t).visit(e)
    }

    function M(e) {
        if (e.children.length === 0) {
            let t = e;
            for (; t = t.parent;)
                if (t.name === "svg") return !0
        }
        return !1
    }
    async function A(e) {
        let {
            name: t,
            attributes: a = {}
        } = e, r = await Promise.all(e.children.map(i => v(i))).then(i => i.join(""));
        if (u in e) {
            let i = await e[u](a, p(r));
            return i && i[N] ? i.value : y(String(i))
        }
        if (t === b) return r;
        let n = M(e);
        return n || D.has(t) ? `<${e.name}${f(a).value}${n?" /":""}>` : `<${e.name}${f(a).value}>${r}</${e.name}>`
    }
    async function v(e) {
        switch (e.type) {
            case 0:
                return Promise.all(e.children.map(t => v(t))).then(t => t.join(""));
            case 1:
                return A(e);
            case 2:
                return `${e.value}`;
            case 3:
                return `<!--${e.value}-->`;
            case 4:
                return `<!${e.value}>`
        }
    }
    async function B(e, t = []) {
        if (!Array.isArray(t)) throw new Error(`Invalid second argument for \`transform\`! Expected \`Transformer[]\` but got \`${typeof t}\``);
        let r = typeof e == "string" ? w(e) : e;
        for (let n of t) r = await n(r);
        return v(r)
    }
    init_define_GLOBALPATHS();

    function f2(t) {
        var n;
        if (t === void 0) return {
            allowElements: [],
            dropElements: ["script"],
            allowComponents: !1,
            allowCustomElements: !1,
            allowComments: !1
        };
        {
            let e = new Set([]);
            (n = t.allowElements) != null && n.includes("script") || e.add("script");
            for (let o2 of t.dropElements ?? []) e.add(o2);
            return {
                allowComponents: !1,
                allowCustomElements: !1,
                allowComments: !1,
                ...t,
                dropElements: Array.from(e)
            }
        }
    }

    function E(t) {
        return t.name.includes("-") ? "custom-element" : /[\_\$A-Z]/.test(t.name[0]) || t.name.includes(".") ? "component" : "element"
    }

    function w2(t, n, e) {
        var o2, l, s, r;
        return ((o2 = e.allowElements) == null ? void 0 : o2.length) > 0 && e.allowElements.includes(t) ? "allow" : ((l = e.blockElements) == null ? void 0 : l.length) > 0 && e.blockElements.includes(t) ? "block" : ((s = e.dropElements) == null ? void 0 : s.length) > 0 && e.dropElements.find(u2 => u2 === t) || n === "component" && !e.allowComponents || n === "custom-element" && !e.allowCustomElements || ((r = e.allowElements) == null ? void 0 : r.length) > 0 ? "drop" : "allow"
    }

    function b2(t, n) {
        var o2, l, s, r, u2, m, d, c;
        let e = t.attributes;
        for (let i of Object.keys(t.attributes))(o2 = n.allowAttributes) != null && o2[i] && ((l = n.allowAttributes) != null && l[i].includes(t.name)) || (r = (s = n.allowAttributes) == null ? void 0 : s[i]) != null && r.includes("*") || ((u2 = n.dropAttributes) != null && u2[i] && ((m = n.dropAttributes) != null && m[i].includes(t.name)) || (c = (d = n.dropAttributes) == null ? void 0 : d[i]) != null && c.includes("*")) && delete e[i];
        return e
    }

    function g(t, n, e) {
        let o2 = E(n),
            {
                name: l
            } = n,
            s = w2(l, o2, t);
        return s === "drop" ? () => {
            e.children = e.children.filter(r => r !== n)
        } : s === "block" ? () => {
            e.children = e.children.map(r => r === n ? r.children : r).flat(1)
        } : () => {
            n.attributes = b2(n, t)
        }
    }

    function N2(t) {
        let n = f2(t);
        return e => {
            let o2 = [];
            z(e, (l, s) => {
                switch (l.type) {
                    case k: {
                        o2.push(g(n, l, s));
                        return
                    }
                    default:
                        return
                }
            });
            for (let l of o2) l();
            return e
        }
    }
    var Changelog = class extends FormApplication {
        SOURCE;
        #converter;
        _updateObject() {
            throw new Error("Method not implemented.")
        }
        constructor(object = {}, options) {
            super(object, options), this.SOURCE = "https://api.github.com/repos/fvtt-fria-ligan/forbidden-lands-foundry-vtt/releases?per_page=10", this.#converter = (() => {
                let options2 = {
                    ...CONST.SHOWDOWN_OPTIONS,
                    headerLevelStart: 2,
                    simplifiedAutoLink: !0,
                    excludeTrailingPunctuationFromURLs: !0,
                    ghCodeBlocks: !0,
                    ghMentions: !0,
                    strikethrough: !0,
                    literalMidWordUnderscores: !0
                };
                for (let key in options2) globalThis.showdown.setOption(key, options2[key]);
                let converter = new globalThis.showdown.Converter;
                return converter.setFlavor("github"), converter
            })()
        }
        async #sanitizeHtml(html) {
            return B(html, [N2({
                allowElements: ["details", "summary", "pre", "code", "h2", "h3", "h4", "h5", "h6", "p", "strong", "b", "em", "u", "s", "a", "ul", "ol", "li", "br", "img"],
                allowAttributes: {
                    a: ["href"],
                    img: ["src", "alt"]
                }
            })])
        }
        async #generateChangelog() {
            let data = await (await fetch(this.SOURCE)).json(),
                localizedDate = new Intl.DateTimeFormat(game.i18n.lang, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
            return (await Promise.allSettled(data.map(async (release, index) => {
                let version = release.tag_name,
                    date = localizedDate.format(new Date(release.published_at)),
                    raw = release.body,
                    html = this.#converter.makeHtml(raw),
                    cleanHtml = await this.#sanitizeHtml(html);
                return `<details ${index===0?"open":""} >
				<summary><i class="fas fa-square-caret-right"></i><h2>${version} \u2013 <span>${date}</span></h2></summary>
				${cleanHtml}
				</details>`
            }))).filter(entry => entry.status === "fulfilled").map(entry => entry.value).join("<hr>")
        }
        async render() {
            let content = await this.#generateChangelog();
            return Dialog.prompt({
                title: "Changelog",
                content: `<h1>${game.i18n.localize("CONFIG.CHANGELOG")}</h1>${content}`,
                options: {
                    width: 600,
                    resizable: !0,
                    classes: ["fbl", "changelog"]
                },
                render: html => {
                    html.find(".dialog-content").scrollTop(0)
                },
                callback: () => {}
            }), this
        }
    };
    init_define_GLOBALPATHS();

    function registerDiceSoNice(dice3d) {
        dice3d.addSystem({
            id: "forbidden-lands",
            name: "Forbidden Lands"
        }, !0), dice3d.addColorset({
            name: "fl-base",
            category: "Forbidden Lands",
            description: "Base Dice",
            background: "#ffffff",
            edge: "#ffffff",
            material: "plastic"
        }), dice3d.addColorset({
            name: "fl-gear",
            category: "Forbidden Lands",
            description: "Gear Dice",
            background: "#000000",
            edge: "#000000",
            material: "plastic"
        }), dice3d.addColorset({
            name: "fl-skill",
            category: "Forbidden Lands",
            description: "Skill Dice",
            background: "#9d1920",
            edge: "#9d1920",
            material: "plastic"
        }), dice3d.addColorset({
            name: "fl-d8",
            category: "Forbidden Lands",
            description: "D8",
            background: "#4f6d47",
            edge: "#4f6d47",
            material: "plastic"
        }), dice3d.addColorset({
            name: "fl-d10",
            category: "Forbidden Lands",
            description: "D10",
            background: "#329bd6",
            edge: "#329bd6",
            material: "plastic"
        }), dice3d.addColorset({
            name: "fl-d12",
            category: "Forbidden Lands",
            description: "D12",
            background: "#f15700",
            edge: "#f15700",
            material: "plastic"
        }), dice3d.addDicePreset({
            type: "db",
            labels: ["systems/forbidden-lands/assets/dsn/d6/d6-1-black.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-black.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-black.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-black.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-black.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-black.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d6/d6-1-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-bump.png"],
            colorset: "fl-base",
            system: "forbidden-lands"
        }, "d6"), dice3d.addDicePreset({
            type: "dg",
            labels: ["systems/forbidden-lands/assets/dsn/d6/d6-1-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-white.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d6/d6-1-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-bump.png"],
            colorset: "fl-gear",
            system: "forbidden-lands"
        }, "d6"), dice3d.addDicePreset({
            type: "ds",
            labels: ["systems/forbidden-lands/assets/dsn/d6/d6-1-skill-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-white.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d6/d6-1-skill-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-bump.png"],
            colorset: "fl-skill",
            system: "forbidden-lands"
        }, "d6"), dice3d.addDicePreset({
            type: "dn",
            labels: ["systems/forbidden-lands/assets/dsn/d6/d6-1-skill-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-white.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d6/d6-1-skill-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-bump.png"],
            colorset: "fl-skill",
            system: "forbidden-lands"
        }, "d6"), dice3d.addDicePreset({
            type: "d6",
            labels: ["systems/forbidden-lands/assets/dsn/d6/d6-1-skill-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-white.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-white.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d6/d6-1-skill-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-2-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-3-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-4-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-5-bump.png", "systems/forbidden-lands/assets/dsn/d6/d6-6-bump.png"],
            colorset: "fl-skill",
            system: "forbidden-lands"
        }, "d6"), dice3d.addDicePreset({
            type: "d8",
            labels: ["systems/forbidden-lands/assets/dsn/d8/d8-1.png", "systems/forbidden-lands/assets/dsn/d8/d8-2.png", "systems/forbidden-lands/assets/dsn/d8/d8-3.png", "systems/forbidden-lands/assets/dsn/d8/d8-4.png", "systems/forbidden-lands/assets/dsn/d8/d8-5.png", "systems/forbidden-lands/assets/dsn/d8/d8-6.png", "systems/forbidden-lands/assets/dsn/d8/d8-7.png", "systems/forbidden-lands/assets/dsn/d8/d8-8.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d8/d8-1-bump.png", "systems/forbidden-lands/assets/dsn/d8/d8-2-bump.png", "systems/forbidden-lands/assets/dsn/d8/d8-3-bump.png", "systems/forbidden-lands/assets/dsn/d8/d8-4-bump.png", "systems/forbidden-lands/assets/dsn/d8/d8-5-bump.png", "systems/forbidden-lands/assets/dsn/d8/d8-6-bump.png", "systems/forbidden-lands/assets/dsn/d8/d8-7-bump.png", "systems/forbidden-lands/assets/dsn/d8/d8-8-bump.png"],
            colorset: "fl-d8",
            system: "forbidden-lands"
        }, "d8"), dice3d.addDicePreset({
            type: "d10",
            labels: ["systems/forbidden-lands/assets/dsn/d10/d10-1.png", "systems/forbidden-lands/assets/dsn/d10/d10-2.png", "systems/forbidden-lands/assets/dsn/d10/d10-3.png", "systems/forbidden-lands/assets/dsn/d10/d10-4.png", "systems/forbidden-lands/assets/dsn/d10/d10-5.png", "systems/forbidden-lands/assets/dsn/d10/d10-6.png", "systems/forbidden-lands/assets/dsn/d10/d10-7.png", "systems/forbidden-lands/assets/dsn/d10/d10-8.png", "systems/forbidden-lands/assets/dsn/d10/d10-9.png", "systems/forbidden-lands/assets/dsn/d10/d10-10.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d10/d10-1-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-2-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-3-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-4-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-5-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-6-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-7-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-8-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-9-bump.png", "systems/forbidden-lands/assets/dsn/d10/d10-10-bump.png"],
            colorset: "fl-d10",
            system: "forbidden-lands"
        }, "d10"), dice3d.addDicePreset({
            type: "d12",
            labels: ["systems/forbidden-lands/assets/dsn/d12/d12-1.png", "systems/forbidden-lands/assets/dsn/d12/d12-2.png", "systems/forbidden-lands/assets/dsn/d12/d12-3.png", "systems/forbidden-lands/assets/dsn/d12/d12-4.png", "systems/forbidden-lands/assets/dsn/d12/d12-5.png", "systems/forbidden-lands/assets/dsn/d12/d12-6.png", "systems/forbidden-lands/assets/dsn/d12/d12-7.png", "systems/forbidden-lands/assets/dsn/d12/d12-8.png", "systems/forbidden-lands/assets/dsn/d12/d12-9.png", "systems/forbidden-lands/assets/dsn/d12/d12-10.png", "systems/forbidden-lands/assets/dsn/d12/d12-11.png", "systems/forbidden-lands/assets/dsn/d12/d12-12.png"],
            bumpMaps: ["systems/forbidden-lands/assets/dsn/d12/d12-1-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-2-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-3-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-4-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-5-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-6-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-7-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-8-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-9-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-10-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-11-bump.png", "systems/forbidden-lands/assets/dsn/d12/d12-12-bump.png"],
            colorset: "fl-d12",
            system: "forbidden-lands"
        }, "d12")
    }

    function registerHooks() {
        if (game.socket.on("system.forbidden-lands", data => {
                data.operation === "pushRoll" && data.isOwner && game.messages.get(data.id)?.delete()
            }), Hooks.once("diceSoNiceReady", dice3d => {
                registerDiceSoNice(dice3d)
            }), Hooks.on("yzeCombatReady", () => {
                if (!game.settings.get("forbidden-lands", "configuredYZEC")) try {
                    game.settings.set("yze-combat", "resetEachRound", !1), game.settings.set("yze-combat", "slowAndFastActions", !0), game.settings.set("yze-combat", "initAutoDraw", !0), game.settings.set("yze-combat", "duplicateCombatantOnCombatStart", !0), game.settings.set("yze-combat", "actorSpeedAttribute", "system.movement.value"), game.settings.set("forbidden-lands", "configuredYZEC", !0)
                } catch {}
            }), Hooks.on("renderPause", (_app, html) => {
                html.find("img").attr("src", "systems/forbidden-lands/assets/fbl-sun.webp")
            }), Hooks.on("chatMessage", (_html, content, _msg) => {
                let commandR = /^\/fblr(?:oll)?/i;
                if (content.match(commandR)) {
                    let diceR = /(\d+d(?:[bsng]|8|10|12))/gi,
                        dice = content.match(diceR),
                        data = {
                            attribute: {
                                label: "DICE.BASE",
                                value: 0
                            },
                            skill: {
                                label: "DICE.SKILL",
                                value: 0
                            },
                            gear: {
                                label: "DICE.GEAR",
                                value: 0,
                                artifactDie: ""
                            }
                        },
                        options = {
                            modifiers: []
                        };
                    if (dice)
                        for (let term of dice) {
                            let [num, deno] = term.split("d"), map = {
                                b: "attribute",
                                s: "skill",
                                g: "gear",
                                n: "negative"
                            };
                            map[deno] === "negative" ? options.modifiers.push({
                                value: -Number(num),
                                active: !0
                            }) : map[deno] ? data[map[deno]].value += Number(num) : data.gear.artifactDie += term
                        }
                    return FBLRollHandler.createRoll(data, options), !1
                }
                return !0
            }), game.settings.get("forbidden-lands", "collapseSheetHeaderButtons"))
            for (let hook of ["renderItemSheet", "renderActorSheet", "renderJournalSheet", "renderApplication"]) Hooks.on(hook, (_app, html) => {
                html.find(".char-gen")?.html(`<i class="fas fa-leaf" data-tooltip="${game.i18n.localize("SHEET.HEADER.CHAR_GEN")}"></i>`), html.find(".rest-up")?.html(`<i class="fas fa-bed" data-tooltip="${game.i18n.localize("SHEET.HEADER.REST")}"></i>`), html.find(".custom-roll")?.html(`<i class="fas fa-dice" data-tooltip="${game.i18n.localize("SHEET.HEADER.ROLL")}"></i>`), html.find(".configure-sheet")?.html(`<i class="fas fa-cog" data-tooltip="${game.i18n.localize("SHEET.CONFIGURE")}"></i>`), html.find(".configure-token")?.html(`<i class="fas fa-user-circle" data-tooltip="${game.i18n.localize("SHEET.TOKEN")}"></i>`), html.find(".item-post")?.html(`<i class="fas fa-comment" data-tooltip="${game.i18n.localize("SHEET.HEADER.POST_ITEM")}"></i>`), html.find(".share-image")?.html(`<i class="fas fa-eye" data-tooltip="${game.i18n.localize("JOURNAL.ActionShow")}"></i>`), html.find(".close")?.html(`<i class="fas fa-times" data-tooltip="${game.i18n.localize("SHEET.CLOSE")}"></i>`)
            });
        Hooks.on("renderItemSheet", app => {
            app._element[0].style.height = "auto"
        }), Hooks.on("renderActorSheet", (app, html) => {
            app.actor.system.type === "party" && (app._element[0].style.height = "auto"), app.cellId?.match(/#gm-screen.+/) && html.find("button").each((_i, button) => {
                button.disabled = !1
            })
        }), Hooks.on("renderJournalSheet", (app, html) => {
            app.document.flags["forbidden-lands"]?.isBook && html.addClass("fbl-book")
        }), Hooks.on("renderChatMessage", async (app, html) => {
            let postedItem = html.find(".chat-item")[0];
            postedItem && (postedItem.classList.add("draggable"), postedItem.setAttribute("draggable", !0), postedItem.addEventListener("dragstart", ev => {
                ev.dataTransfer.setData("text/plain", JSON.stringify({
                    item: app.getFlag("forbidden-lands", "itemData"),
                    type: "itemDrop"
                }))
            }));
            let pushButton = html.find(".fbl-button.push")[0];
            pushButton && pushButton.addEventListener("click", async () => {
                if (app.rolls[0]?.pushable) {
                    await FBLRollHandler.pushRoll(app);
                    let fireEvent = () => {
                        app.permission === 3 ? app.delete() : game.socket.emit("system.forbidden-lands", {
                            operation: "pushRoll",
                            isOwner: app.roll?.isOwner,
                            id: app.id
                        })
                    };
                    game.modules.get("dice-so-nice")?.active ? Hooks.once("diceSoNiceRollComplete", () => {
                        fireEvent()
                    }) : fireEvent()
                }
            });
            let tableButton = html.find(".fbl-button.table")[0];
            tableButton && tableButton.addEventListener("click", async () => {
                let table;
                if (tableButton.dataset.action === "prey") {
                    let tables = game.settings.get("forbidden-lands", "otherTables");
                    table = game.tables.get(tables["travel-find-prey"])
                } else table = game.tables.get(tableButton.dataset.id);
                table ? table.draw({
                    displayChat: !0
                }) : ui.notifications?.warn("Could not find mishap table")
            })
        }), Hooks.on("gmScreenOpenClose", (app, _config) => {
            app.element.find("button").each((_i, button) => {
                button.disabled = !1
            })
        }), Hooks.on("hotbarDrop", async (_2, data, slot) => handleHotbarDrop(data, slot)), Hooks.on("renderSidebarTab", (app, html) => {
            if (app.tabName !== "settings") return;
            let section = html.find("#settings-documentation"),
                button = `<button type="button"><i class='fas fa-book'></i> ${game.i18n.localize("CONFIG.CHANGELOG")}</button>`;
            section.prepend(button).on("click", ev => {
                ev.preventDefault(), new Changelog().render(!0)
            })
        })
    }
    init_define_GLOBALPATHS();
    var migrateWorld = async () => {
        let systemVersion, worldSchemaVersion;
        try {
            systemVersion = Number(game.system.version.split(".")[0]), worldSchemaVersion = Number(game.settings.get("forbidden-lands", "worldSchemaVersion") || 0)
        } catch (error) {
            throw ui.notifications.error("Failed getting version numbers. Backup your files and contact support."), new Error(`Failed getting version numbers: ${error}`)
        }
        if (worldSchemaVersion < systemVersion && game.user.isGM) {
            ui.notifications.info("Upgrading the world, please wait...");
            for (let actor of game.actors) try {
                let update = migrateActorData(actor.toObject(), worldSchemaVersion);
                if (!foundry.utils.isEmpty(update)) {
                    let updated = await actor.update(update, {
                        enforceTypes: !1
                    })
                }
            } catch {
                ui.notifications.error("Migration of actors failed.")
            }
            for (let item of game.items) try {
                let update = migrateItemData(item.toObject(), worldSchemaVersion);
                if (!foundry.utils.isEmpty(update)) {
                    let updated = await item.update(update, {
                        enforceTypes: !1
                    })
                }
            } catch {
                ui.notifications.error("Migration of items failed.")
            }
            for (let scene of game.scenes) try {
                let updateData = migrateSceneData(scene.data);
                if (!foundry.utils.isEmpty(updateData)) {
                    await scene.update(updateData, {
                        enforceTypes: !1
                    });
                    for (let token of scene.tokens) token._actor = null
                }
            } catch (err) {
                err.message = `Failed migration for Scene ${scene.name}: ${err.message}`
            }
            for (let pack of game.packs.filter(p2 => p2.metadata.package === "world" && ["Actor", "Item", "Scene"].includes(p2.metadata.type))) await migrateCompendium(pack, worldSchemaVersion);
            migrateSettings(worldSchemaVersion), ui.notifications.info("Upgrade complete!")
        }
        game.settings.set("forbidden-lands", "worldSchemaVersion", systemVersion)
    }, migrateActorData = (actor, worldSchemaVersion) => {
        let update = {};
        if (worldSchemaVersion < 3 && actor.type === "character" && (actor.system.condition.sleepy || (update["system.condition.sleepy"] = actor.system.condition.sleepless)), worldSchemaVersion < 7 && actor.type === "character")
            for (let [key, data] of Object.entries(actor.system.consumable)) {
                let map = {
                    0: 0,
                    6: 1,
                    8: 2,
                    10: 3,
                    12: 4
                };
                update[`system.consumable.${key}.value`] = map[data.value]
            }
        if (!actor.items) return update;
        let items = actor.items.reduce((arr, i) => {
            let itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i,
                itemUpdate = migrateItemData(itemData, worldSchemaVersion);
            return foundry.utils.isEmpty(itemUpdate) || (itemUpdate._id = itemData._id, arr.push(expandObject(itemUpdate))), arr
        }, []);
        return items.length > 0 && (update.items = items), update
    }, migrateItemData = (item, worldSchemaVersion) => {
        let update = {};
        if (worldSchemaVersion < 3)
            if (item.type === "artifact" && (update.type = "weapon"), item.type === "armor") update["system.bonus"] = item.system.rating;
            else {
                let baseBonus = 0,
                    artifactBonus = "";
                if (item.system.bonus) {
                    let parts = item.system.bonus.split("+").map(p2 => p2.trim());
                    for (let part of parts) Number.isNumeric(part) ? baseBonus += +part : artifactBonus.length ? artifactBonus = `${artifactBonus} + ${part}` : artifactBonus = part
                }
                update["system.bonus"] = {
                    value: baseBonus,
                    max: baseBonus
                }, update["system.artifactBonus"] = artifactBonus
            } if (worldSchemaVersion < 4 && item.type === "spell" && !item.system.spellType && (update["system.spellType"] = "SPELL.SPELL"), worldSchemaVersion < 5 && item.type === "weapon" && typeof item.system.features == "string") {
            let features = item.system.features.replace(".", "").replace(/loading is a slow action/i, "slowReload").replace(/slow reload/i, "slowReload").split(", ");
            update["system.features"] = {
                edged: !1,
                pointed: !1,
                blunt: !1,
                parrying: !1,
                hook: !1,
                slowReload: !1,
                others: ""
            };
            let otherFeatures = "";
            for (let feature of features) {
                let lcFeature = feature === "slowReload" ? feature : feature.toLowerCase();
                lcFeature in update["system.features"] ? update["system.features"][lcFeature] = !0 : otherFeatures += `${feature}, `
            }
            update["system.features"].others = otherFeatures.substr(0, otherFeatures.length - 2)
        }
        return worldSchemaVersion < 7 && (item.type === "monsterTalent" && (update.type = "talent", update["system.type"] = "monster"), item.type === "weapon" && (update["system.ammo"] = "other")), update
    }, migrateSceneData = scene => ({
        tokens: scene.tokens.map(token => {
            let t = token.toJSON();
            if (!t.actorId || t.actorLink) t.actorData = {};
            else if (!game.actors.has(t.actorId)) t.actorId = null, t.actorData = {};
            else if (!t.actorLink) {
                let actorData = duplicate(t.actorData);
                actorData.type = token.actor?.type;
                let update = migrateActorData(actorData);
                for (let embeddedName of ["items", "effects"]) {
                    if (!update[embeddedName]?.length) continue;
                    let updates = new Map(update[embeddedName].map(u2 => [u2._id, u2]));
                    for (let embedded of actorData[embeddedName]) {
                        let toUpdate = updates.get(embedded._id);
                        toUpdate && mergeObject(embedded, toUpdate)
                    }
                    delete update[embeddedName]
                }
                mergeObject(t.actorData, update)
            }
            return t
        })
    }), migrateCompendium = async (pack, worldSchemaVersion) => {
        let entity = pack.metadata.entity;
        if (!["Actor", "Item", "Scene"].includes(entity)) return;
        let wasLocked = pack.locked;
        await pack.configure({
            locked: !1
        }), await pack.migrate();
        let documents = await pack.getDocuments();
        for (let doc of documents) {
            let updateData = {};
            try {
                switch (entity) {
                    case "Actor":
                        updateData = migrateActorData(doc.toObject(), worldSchemaVersion);
                        break;
                    case "Item":
                        updateData = migrateItemData(doc.toObject(), worldSchemaVersion);
                        break;
                    case "Scene":
                        updateData = migrateSceneData(doc.data, worldSchemaVersion);
                        break
                }
                if (foundry.utils.isEmpty(updateData)) continue;
                await doc.update(updateData)
            } catch (err) {
                err.message = `Failed migration for entity ${doc.name} in pack ${pack.collection}: ${err.message}`
            }
        }
        await pack.configure({
            locked: wasLocked
        })
    }, migrateSettings = async worldSchemaVersion => {
        worldSchemaVersion < 4 && (game.settings.set("forbidden-lands", "showCraftingFields", !0), game.settings.set("forbidden-lands", "showCostField", !0), game.settings.set("forbidden-lands", "showSupplyField", !0), game.settings.set("forbidden-lands", "showEffectField", !0), game.settings.set("forbidden-lands", "showDescriptionField", !0), game.settings.set("forbidden-lands", "showDrawbackField", !0), game.settings.set("forbidden-lands", "showAppearanceField", !0)), worldSchemaVersion < 5 && game.settings.set("forbidden-lands", "alternativeSkulls", !1)
    };
    init_define_GLOBALPATHS();
    Hooks.on("renderSettingsConfig", (_app, html, _user) => {
        let target = html.find('input[name="forbidden-lands.datasetDir"]')[0];
        if (!target) return;
        let targetParent = target.previousElementSibling,
            resetButton = $(`<button type="button" class="file-picker" data-tooltip="${localizeString("FLCG.SETTINGS.RESET")}"><i class="fas fa-undo"></i></button>`);
        resetButton.on("click", function() {
            target.value = "", this.blur()
        });
        let experimentalButton = $(`<button type="button" class="file-picker" data-tooltip="${localizeString("FLCG.SETTINGS.RFP_SET")}"><i class="fas fa-flask"></i></button>`);
        experimentalButton.on("click", function() {
            target.value = "systems/forbidden-lands/assets/datasets/chargen/dataset-experimental.json", this.blur()
        }), targetParent.after(experimentalButton[0], resetButton[0])
    });
    var TableConfigMenu = class extends FormApplication {
            #resolve = null;
            #promise = new Promise(resolve => {
                this.#resolve = resolve
            });
            static get defaultOptions() {
                return mergeObject(super.defaultOptions, {
                    template: "systems/forbidden-lands/templates/components/tables-config.hbs",
                    classes: ["tables-config"],
                    title: "CONFIG.TABLE_CONFIG.TITLE",
                    submitOnClose: !1
                })
            }
            async getData() {
                let data = await super.getData(),
                    mishapConfig = game.settings.get("forbidden-lands", "mishapTables"),
                    encounterConfig = game.settings.get("forbidden-lands", "encounterTables"),
                    otherConfig = game.settings.get("forbidden-lands", "otherTables"),
                    mishapKeys = CONFIG.fbl.mishapTables,
                    encounterKeys = CONFIG.fbl.encounterTables,
                    otherKeys = CONFIG.fbl.otherTables;
                return data.mishapTables = mishapKeys.map(key => ({
                    key,
                    name: localizeString(key),
                    id: mishapConfig[key]
                })), data.encounterTables = encounterKeys.map(key => ({
                    key,
                    name: localizeString(key),
                    id: encounterConfig[key]
                })), data.otherTables = otherKeys.map(key => ({
                    key,
                    name: localizeString(key),
                    id: otherConfig[key]
                })), data.tables = (() => {
                    let selectOptions = {},
                        tree = game.tables.directory.folders;
                    for (let folder of tree) {
                        let options = folder.contents?.map(table => `<option value="${table.id}">${table.name}</option>`) ?? null;
                        if (options.length > 0)
                            if (selectOptions[folder.name]) selectOptions[folder.name] += options;
                            else {
                                let property = `<optgroup label="${folder.name}">${options}`;
                                selectOptions[folder.name] = property
                            }
                    }
                    return Object.values(selectOptions).join("")
                })(), data
            }
            _updateObject(_event, formData) {
                let tables = Object.entries(formData).reduce((acc, [key, value]) => {
                    let [tableType, tableKey] = key.split("_");
                    return acc[tableType] || (acc[tableType] = {}), acc[tableType][tableKey] = value, acc
                }, {});
                game.settings.set("forbidden-lands", "mishapTables", tables.mishap), game.settings.set("forbidden-lands", "encounterTables", tables.encounter), game.settings.set("forbidden-lands", "otherTables", tables.other)
            }
            async render(force, context = {}) {
                return await super.render(force, context), this.#promise
            }
            async close(...args) {
                await super.close(...args), this.#resolve()
            }
        },
        SheetConfigMenu = class extends FormApplication {
            #resolve = null;
            #promise = new Promise(resolve => {
                this.#resolve = resolve
            });
            static get defaultOptions() {
                return mergeObject(super.defaultOptions, {
                    template: "systems/forbidden-lands/templates/components/sheet-config.hbs",
                    classes: ["sheet-config"],
                    title: "CONFIG.SHEET_CONFIG.TITLE",
                    submitOnClose: !1
                })
            }
            async getData() {
                let data = await super.getData(),
                    config = {
                        showCraftingFields: "CONFIG.CRAFTINGFIELD",
                        showCostField: "CONFIG.COSTFIELD",
                        showSupplyField: "CONFIG.SUPPLYFIELD",
                        showEffectField: "CONFIG.EFFECTFIELD",
                        showDescriptionField: "CONFIG.DESCRIPTIONFIELD",
                        showDrawbackField: "CONFIG.DRAWBACKFIELD",
                        showAppearanceField: "CONFIG.APPEARANCEFIELD"
                    };
                return data.config = Object.entries(config).map(([key, label]) => ({
                    key,
                    label: localizeString(label),
                    description: localizeString(`${label}_DESC`),
                    checked: game.settings.get("forbidden-lands", key)
                })), data
            }
            _updateObject(_event, formData) {
                for (let [key, value] of Object.entries(formData)) game.settings.set("forbidden-lands", key, value)
            }
            async render(force, context = {}) {
                return await super.render(force, context), this.#promise
            }
            async close(...args) {
                await super.close(...args), this.#resolve()
            }
        };

    function registerSettings() {
        game.settings.register("forbidden-lands", "worldSchemaVersion", {
            name: "World Version",
            hint: "Used to automatically upgrade worlds data when the system is upgraded.",
            scope: "world",
            config: !1,
            default: 0,
            type: Number
        }), game.settings.register("forbidden-lands", "configuredYZEC", {
            name: "YZEC Configured",
            hint: "Used to track if the YZEC has been configured.",
            scope: "world",
            config: !1,
            default: !1,
            type: Boolean
        }), game.settings.register("forbidden-lands", "messages", {
            name: "Displayed Messages",
            hint: "Used to track which messages have been displayed.",
            scope: "world",
            config: !1,
            default: [],
            type: Array
        }), game.settings.register("forbidden-lands", "showCraftingFields", {
            name: "CONFIG.CRAFTINGFIELD",
            hint: "CONFIG.CRAFTINGFIELD_DESC",
            scope: "client",
            config: !1,
            default: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "showCostField", {
            name: "CONFIG.COSTFIELD",
            hint: "CONFIG.COSTFIELD_DESC",
            scope: "client",
            config: !1,
            default: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "showSupplyField", {
            name: "CONFIG.SUPPLYFIELD",
            hint: "CONFIG.SUPPLYFIELD_DESC",
            scope: "client",
            config: !1,
            default: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "showEffectField", {
            name: "CONFIG.EFFECTFIELD",
            hint: "CONFIG.EFFECTFIELD_DESC",
            scope: "client",
            config: !1,
            default: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "showDescriptionField", {
            name: "CONFIG.DESCRIPTIONFIELD",
            hint: "CONFIG.DESCRIPTIONFIELD_DESC",
            scope: "client",
            config: !1,
            default: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "showDrawbackField", {
            name: "CONFIG.DRAWBACKFIELD",
            hint: "CONFIG.DRAWBACKFIELD_DESC",
            scope: "client",
            config: !1,
            default: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "showAppearanceField", {
            name: "CONFIG.APPEARANCEFIELD",
            hint: "CONFIG.APPEARANCEFIELD_DESC",
            scope: "client",
            config: !1,
            default: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "mishapTables", {
            name: "Mishap Tables",
            scope: "world",
            config: !1,
            default: {}
        }), game.settings.register("forbidden-lands", "encounterTables", {
            name: "Encounter Tables",
            scope: "world",
            config: !1,
            default: {}
        }), game.settings.register("forbidden-lands", "otherTables", {
            name: "Other Tables",
            scope: "world",
            config: !1,
            default: {}
        }), game.settings.registerMenu("forbidden-lands", "changelog", {
            name: "CONFIG.CHANGELOG",
            hint: "CONFIG.CHANGELOG_DESC",
            label: "CONFIG.CHANGELOG_LABEL",
            icon: "fas fa-book",
            type: Changelog
        }), game.settings.registerMenu("forbidden-lands", "tableConfigMenu", {
            name: "CONFIG.TABLE_CONFIG_MENU",
            hint: "CONFIG.TABLE_CONFIG_MENU_DESC",
            label: "CONFIG.TABLE_CONFIG_MENU_LABEL",
            icon: "fas fa-th-list",
            type: TableConfigMenu,
            restricted: !0
        }), game.settings.registerMenu("forbidden-lands", "sheetConfigMenu", {
            name: "CONFIG.SHEET_CONFIG_MENU",
            hint: "CONFIG.SHEET_CONFIG_MENU_DESC",
            label: "CONFIG.SHEET_CONFIG_MENU_LABEL",
            icon: "fas fa-scroll",
            type: SheetConfigMenu
        }), game.settings.register("forbidden-lands", "darkmode", {
            name: "SETTINGS.DARKMODE",
            hint: "SETTINGS.DARKMODE_HINT",
            scope: "client",
            config: !0,
            default: !1,
            requiresReload: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "removeBorders", {
            name: "SETTINGS.REMOVEBORDERS",
            hint: "SETTINGS.REMOVEBORDERS_HINT",
            scope: "client",
            config: !0,
            default: !1,
            requiresReload: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "collapseSheetHeaderButtons", {
            name: "CONFIG.COLLAPSE_SHEET_HEADER_BUTTONS",
            hint: "CONFIG.COLLAPSE_SHEET_HEADER_BUTTONS_DESC",
            scope: "client",
            config: !0,
            default: !1,
            type: Boolean,
            requiresReload: !0
        }), game.settings.register("forbidden-lands", "alternativeSkulls", {
            name: "CONFIG.ALTERNATIVESKULLS",
            hint: "CONFIG.ALTERNATIVESKULLS_DESC",
            scope: "client",
            config: !0,
            default: !1,
            requiresReload: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "useHealthAndResolve", {
            name: "CONFIG.HEALTHANDRESOLVE",
            hint: "CONFIG.HEALTHANDRESOLVE_DESC",
            scope: "client",
            config: !0,
            default: !1,
            requiresReload: !0,
            type: Boolean
        }), game.settings.register("forbidden-lands", "maxInit", {
            name: "CONFIG.MAX_INIT",
            hint: "CONFIG.MAX_INIT_DESC",
            scope: "world",
            config: !0,
            default: 10,
            onChange: value => {
                CONFIG.fbl.maxInit = value
            },
            type: Number
        }), game.settings.register("forbidden-lands", "autoDecreaseConsumable", {
            name: "CONFIG.AUTO_DECREASE_CONSUMABLE",
            hint: "CONFIG.AUTO_DECREASE_CONSUMABLE_DESC",
            config: !0,
            default: 2,
            type: Number
        }), game.settings.register("forbidden-lands", "datasetDir", {
            name: "FLCG.SETTINGS.DATASET",
            hint: "FLCG.SETTINGS.DATASET_HINT",
            scope: "world",
            config: !0,
            default: "",
            filePicker: "json",
            type: String
        })
    }
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    var CharacterConverter = class {
        constructor(dataset) {
            this.character = null, this.dataset = dataset
        }
        async convert(character) {
            return this.character = character, {
                data: this.buildCharacterData(),
                items: this.buildCharacterItems()
            }
        }
        buildCharacterData() {
            let kin = this.dataset.kin[this.character.kin],
                age = this.character.age,
                agePenalty = age.ageKey,
                profession = this.dataset.profession[this.character.profession];
            return {
                bio: {
                    kin: {
                        value: kin.name
                    },
                    age: {
                        value: age.ageNumber
                    },
                    profession: {
                        value: profession.name
                    },
                    note: {
                        value: this.generateNotes(this.character)
                    }
                },
                consumable: {
                    food: {
                        value: profession.consumables.food
                    },
                    water: {
                        value: profession.consumables.water
                    },
                    arrows: {
                        value: profession.consumables.arrows
                    },
                    torches: {
                        value: profession.consumables.torches
                    }
                },
                currency: {
                    gold: {
                        value: profession.currency.gold > 0 ? this.rollNumber(1, profession.currency.gold) : 0
                    },
                    silver: {
                        value: profession.currency.silver > 0 ? this.rollNumber(1, profession.currency.silver) : 0
                    },
                    copper: {
                        value: profession.currency.copper > 0 ? this.rollNumber(1, profession.currency.copper) : 0
                    }
                },
                attribute: this.generateAttributes(),
                skill: this.generateSkills()
            }
        }
        buildCharacterItems() {
            let items = [];
            return items = items.concat(this.buildTalents()), items = items.concat(this.buildEventGear()), items
        }
        buildEventGear() {
            let gear = [];
            for (let i = 0; i < this.character.formativeEvents.length; i++) {
                let event = this.character.formativeEvents[i];
                gear.push(this.createNewItem(event.items).toObject())
            }
            return gear
        }
        buildTalents() {
            let kin = this.dataset.kin[this.character.kin],
                profession = this.dataset.profession[this.character.profession],
                talents = [this.getItem(kin.talent, "talent"), this.getItem(profession.paths[this.character.path], "talent")];
            for (let i = 0; i < this.character.formativeEvents.length; i++) {
                let event = this.character.formativeEvents[i];
                talents.push(this.getExactItem(event.talent, "talent"))
            }
            return talents
        }
        getExactItem(itemName, type = !1) {
            let nameLowerCase = itemName.toLowerCase();
            type = type && type.toLowerCase();
            let item = game.items.find(i => i.name.toLowerCase() === nameLowerCase && (type === !1 || i.type === type));
            return item || (item = this.createNewItem(itemName, type)), item.toObject()
        }
        getItem(itemName, type = !1) {
            let nameLowerCase = itemName.toLowerCase();
            type = type && type.toLowerCase();
            let item = game.items.find(i => i.name.toLowerCase().includes(nameLowerCase) && (type === !1 || i.type === type));
            return item || (item = this.createNewItem(itemName, type)), item.toObject()
        }
        createNewItem(itemName, type = !1) {
            let ItemClass = CONFIG.Item.documentClass;
            return new ItemClass({
                name: itemName,
                type: type || "gear",
                data: type === "talent" ? {} : {
                    weight: "none"
                }
            })
        }
        generateAttributes() {
            let attributes = JSON.parse(JSON.stringify(this.character.childhood.attributes)),
                agePenalty = this.character.age.ageKey,
                attrs = ["strength", "agility", "wits", "empathy"];
            for (let i = 0; i < agePenalty; i++) attributes[attrs[this.rollNumber(0, 3)]] -= 1;
            return {
                strength: {
                    value: attributes.strength,
                    max: attributes.strength
                },
                agility: {
                    value: attributes.agility,
                    max: attributes.agility
                },
                wits: {
                    value: attributes.wits,
                    max: attributes.wits
                },
                empathy: {
                    value: attributes.empathy,
                    max: attributes.empathy
                }
            }
        }
        generateSkills() {
            let skills = Object.keys(CONFIG.fbl.skillAttributeMap).reduce((obj, skill) => {
                let skillValue = {
                    value: 0
                };
                return obj[skill] = skillValue, obj
            }, {});

            function increaseSkill(skillObj) {
                for (let [skillName, skillValue] of Object.entries(skillObj)) skills[skillName].value += Number.parseInt(skillValue)
            }
            increaseSkill(this.character.childhood.skills);
            for (let event of this.character.formativeEvents) increaseSkill(event.skills);
            return skills
        }
        generateNotes(character) {
            let homeland = character.homeland ? `<p>${game.i18n.localize("FLCG.HOMELAND")} ${character.homeland}.</p>` : "",
                childhood = character.childhood,
                notes = `<h3>${game.i18n.localize("FLCG.CHILDHOOD")}: ${childhood.name}</h3>
			<p>${childhood.description}</p>
			${homeland}`;
            for (let i = 0; i < character.formativeEvents.length; i++) {
                let event = character.formativeEvents[i];
                notes += `<h3>${game.i18n.localize("FLCG.EVENT")}: ${event.name}</h3><p>${event.description}</p>`
            }
            return `<div class="fbl-core">${notes}</div>`
        }
        rollNumber(min, max) {
            return Math.floor(Math.random() * (max + 1 - min)) + min
        }
    };
    var ForbiddenLandsCharacterGenerator = class _ForbiddenLandsCharacterGenerator extends Application {
        constructor(dataset, existActor, options = {}) {
            super(options), this.character = null, this.existActor = existActor, this.dataset = dataset
        }
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                classes: ["forbidden-lands", "sheet", "actor"],
                template: "systems/forbidden-lands/templates/components/character-generator/generator-sheet.hbs",
                title: game.i18n.localize("FLCG.TITLE"),
                width: 700,
                height: 840,
                resizable: !1
            })
        }
        static async loadDataset() {
            let dataset = game.settings.get("forbidden-lands", "datasetDir") || null;
            if (dataset && dataset.substr(-4, 4) !== "json") throw _ForbiddenLandsCharacterGenerator.handleBadDataset(game.i18n.localize("FLCG.ERROR_NOT_A_DATAFILE"));
            let lang = game.i18n.lang,
                defaultDataset = `systems/forbidden-lands/assets/datasets/chargen/${CONFIG.fbl.dataSetConfig[lang]||"dataset"}.json`;
            return (await fetch(dataset || defaultDataset).catch(_err => ({}))).json()
        }
        async getData() {
            let data = super.getData();
            return this.character === null && (this.character = await this.generateCharacter()), data.character = this.character, data.dataset = this.dataset, data.dataset.childhood = this.dataset.kin[this.character.kin].childhood, data.dataset.paths = this.dataset.profession[this.character.profession].paths, data.dataset.formativeEvents = this.dataset.profession[this.character.profession].formativeEvents, data
        }
        activateListeners(html) {
            super.activateListeners(html), html.find(".chargen-randomize-all").click(this.handleRandomizeAll.bind(this)), html.find(".chargen-create-actor").click(this.handleCreateActor.bind(this)), html.find(".chargen-roll-kin").click(this.handleRollKin.bind(this)), html.find(".chargen-roll-age").click(this.handleRollAge.bind(this)), html.find(".chargen-roll-childhood").click(this.handleRollChildhood.bind(this)), html.find(".chargen-roll-profession").click(this.handleRollProfession.bind(this)), html.find(".chargen-roll-path").click(this.handleRollPath.bind(this)), html.find(".chargen-roll-event").click(this.handleRollEvent.bind(this)), html.find(".chargen-select-kin").change(this.handleInputKin.bind(this)), html.find(".chargen-age-input").change(this.handleInputAge.bind(this)), html.find(".chargen-select-childhood").change(this.handleInputChildhood.bind(this)), html.find(".chargen-select-profession").change(this.handleInputProfession.bind(this)), html.find(".chargen-select-path").change(this.handleInputPath.bind(this)), html.find(".chargen-select-event").change(this.handleInputEvent.bind(this))
        }
        _getHeaderButtons() {
            return super._getHeaderButtons()
        }
        async handleCreateActor() {
            if (!this.existActor) return ui.notifications.error("FLCG.ERROR_NO_ACTOR", {
                localize: !0
            }), this.close();
            let updateData = await new CharacterConverter(this.dataset).convert(this.character);
            return this.existActor.items.contents.length > 0 && await this.handleDeleteExistingItems(), await this.existActor.update({
                system: updateData.data
            }), await this.existActor.createEmbeddedDocuments("Item", updateData.items), this.close()
        }
        async handleDeleteExistingItems() {
            let toDelete = this.existActor.items.map(item => item.id);
            return await this.existActor.deleteEmbeddedDocuments("Item", toDelete)
        }
        handleInputKin(event) {
            let kinKey = $(event.currentTarget).val();
            return this.character = this.setKin(this.character, kinKey), this.render(!0), !1
        }
        handleInputAge(event) {
            let mapping = [game.i18n.localize("FLCG.YOUNG"), game.i18n.localize("FLCG.ADULT"), game.i18n.localize("FLCG.OLD")],
                ageNumber = Number.parseInt($(event.currentTarget).val()),
                kin = this.dataset.kin[this.character.kin],
                ageKey = 2;
            for (let i = 0; i < 3; i++) {
                let range = kin.age[i];
                if (ageNumber >= range[0] && ageNumber <= range[1]) {
                    ageKey = i;
                    break
                }
            }
            return this.character.age = {
                ageKey,
                ageNumber,
                ageString: mapping[ageKey]
            }, this.character = this.rollFormativeEvents(this.character), this.render(!0), !1
        }
        handleInputChildhood(event) {
            let childhoodKey = $(event.currentTarget).val(),
                kin = this.dataset.kin[this.character.kin];
            return this.character.childhood = kin.childhood[childhoodKey], this.render(!0), !1
        }
        handleInputProfession(event) {
            let professionKey = $(event.currentTarget).val();
            return this.character.profession = professionKey, this.character = this.rollPath(this.character), this.character.formativeEvents = !1, this.character = this.rollFormativeEvents(this.character), this.render(!0), !1
        }
        handleInputPath(event) {
            let pathKey = Number.parseInt($(event.currentTarget).val());
            return this.character.path = pathKey, this.render(!0), !1
        }
        handleInputEvent(event) {
            let el = $(event.currentTarget),
                id = Number.parseInt(el.data("key")),
                eventKey = el.val(),
                profession = this.dataset.profession[this.character.profession];
            return this.character.formativeEvents[id] = profession.formativeEvents[eventKey], this.render(!0), !1
        }
        handleRollKin(_event) {
            return this.character = this.setKin(this.character), this.render(!0), !1
        }
        handleRollAge(_event) {
            return this.character.age = this.rollAge(this.dataset.kin[this.character.kin].age), this.character = this.rollFormativeEvents(this.character), this.render(!0), !1
        }
        handleRollChildhood(_event) {
            let kin = this.dataset.kin[this.character.kin];
            return this.character.childhood = this.rollOn(kin.childhood), this.render(!0), !1
        }
        handleRollProfession(_event) {
            return this.character.profession = this.rollOn(this.dataset.profession).key, this.character = this.rollPath(this.character), this.character.formativeEvents = !1, this.character = this.rollFormativeEvents(this.character), this.render(!0), !1
        }
        handleRollPath(_event) {
            return this.character = this.rollPath(this.character), this.render(!0), !1
        }
        handleRollEvent(event) {
            let profession = this.dataset.profession[this.character.profession],
                button = $(event.currentTarget),
                id = Number.parseInt(button.data("key")),
                rolled = [],
                newEvent = {};
            for (let i = 0; i < this.character.formativeEvents.length; i++) {
                if (i === id) continue;
                let formativeEvent = this.character.formativeEvents[i];
                rolled.push(formativeEvent.key)
            }
            do newEvent = this.rollOn(profession.formativeEvents); while (rolled.includes(newEvent.key));
            return this.character.formativeEvents[id] = newEvent, this.render(!0), !1
        }
        async handleRandomizeAll(_event) {
            return this.character = await this.generateCharacter(), this.render(!0), !1
        }
        async generateCharacter() {
            if (!this.dataset.profession || !this.dataset.kin) throw _ForbiddenLandsCharacterGenerator.handleBadDataset(game.i18n.localize("FLCG.ERROR_DATASET_WRONG_FORMAT"), this);
            let character = {};
            character = this.setKin(character);
            let profession = this.rollOn(this.dataset.profession);
            return character.profession = profession.key, character = this.rollHomeland(character), character = this.rollPath(character), character = this.rollFormativeEvents(character), character
        }
        setKin(character, kinKey) {
            let kin = kinKey ? this.dataset.kin[kinKey] : this.rollOn(this.dataset.kin);
            return character.kin = kin.key, character.kin === "elf" ? (character.age = {
                ageNumber: Number.NaN,
                ageKey: 1,
                ageString: game.i18n.localize("FLCG.ADULT")
            }, character = this.rollFormativeEvents(character)) : character.age === void 0 ? character.age = this.rollAge(kin.age) : character.age.ageNumber = this.rollNumber(kin.age[character.age.ageKey][0], kin.age[character.age.ageKey][1]), character.childhood = this.rollOn(kin.childhood), character
        }
        rollHomeland(character) {
            if (this.dataset.kin[character.kin]?.homeland) {
                let numberOfHomelands = this.dataset.kin[character.kin]?.homeland?.length || 1;
                character.homeland = this.dataset.kin[character.kin]?.homeland[this.rollNumber(0, numberOfHomelands - 1)]
            }
            return character
        }
        rollPath(character) {
            let numberOfPaths = this.dataset.profession[character.profession]?.paths?.length - 1 || this.dataset.paths?.length - 1 || 2;
            return character.path = this.rollNumber(0, numberOfPaths), character
        }
        rollFormativeEvents(character) {
            let profession = this.dataset.profession[character.profession];
            if (!profession) return character;
            let formativeEvents = [],
                rolled = [],
                event = {};
            if (character.formativeEvents)
                if (character.formativeEvents.length < character.age.ageKey + 1) {
                    for (let i = 0; i < character.formativeEvents.length; i++) {
                        let element = character.formativeEvents[i];
                        rolled.push(element.key), formativeEvents.push(element)
                    }
                    for (let i = character.formativeEvents.length; i < character.age.ageKey + 1; i++) {
                        do event = this.rollOn(profession.formativeEvents); while (rolled.includes(event.key));
                        rolled.push(event.key), formativeEvents.push(event)
                    }
                } else character.formativeEvents.length > character.age.ageKey + 1 ? formativeEvents = character.formativeEvents.slice(0, character.age.ageKey + 1) : formativeEvents = character.formativeEvents;
            else
                for (let i = 0; i < character.age.ageKey + 1; i++) {
                    do event = this.rollOn(profession.formativeEvents); while (rolled.includes(event.key));
                    rolled.push(event.key), formativeEvents.push(event)
                }
            return character.formativeEvents = formativeEvents, character
        }
        rollOn(options) {
            let rollTable = this.buildRollTable(options);
            return options[this.rollTable(rollTable)]
        }
        rollAge(ageRanges) {
            let mapping = [game.i18n.localize("FLCG.YOUNG"), game.i18n.localize("FLCG.ADULT"), game.i18n.localize("FLCG.OLD")],
                age = {};
            return age.ageKey = this.rollNumber(0, 2), age.ageNumber = this.rollNumber(ageRanges[age.ageKey][0], ageRanges[age.ageKey][1]), age.ageString = mapping[age.ageKey], age
        }
        buildRollTable(options) {
            let rollTable = [];
            for (let key in options)
                if (Object.hasOwn(options, key)) {
                    let element = options[key];
                    rollTable = rollTable.concat(Array(element.weight).fill(element.key))
                } return rollTable
        }
        rollNumber(min, max) {
            return Math.floor(Math.random() * (max + 1 - min)) + min
        }
        rollTable(rollTable) {
            return rollTable[this.rollNumber(0, rollTable.length - 1)]
        }
        static async handleBadDataset(err, app) {
            return app ? (ui.notifications.warn("FLCG.WARNING_DATASET_NOT_VALID", {
                localize: !0
            }), app.close(), await game.settings.set("forbidden-lands", "datasetDir", ""), (await new _ForbiddenLandsCharacterGenerator(await _ForbiddenLandsCharacterGenerator.loadDataset(), app.existActor)).render(!0)) : ui.notifications.error("FLCG.ERROR_CANNOT_REVOCER", {
                localize: !0
            })
        }
    };
    init_define_GLOBALPATHS();
    var ActorSheetConfig = class extends DocumentSheetConfig {
        static get defaultOptions() {
            return foundry.utils.mergeObject(super.defaultOptions, {
                title: "Configure Actor",
                template: "systems/forbidden-lands/templates/components/sheet-config-modal.hbs"
            })
        }
        getData() {
            return {
                ...super.getData(),
                types: CONFIG.fbl.characterSubtype
            }
        }
        async _updateObject(event, formData) {
            event.preventDefault();
            let original = this.getData({});
            if (this.object.update(formData), formData.sheetClass !== original.sheetClass || formData.defaultClass !== original.defaultClass) return super._updateObject(event, formData)
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsActorSheet = class extends ActorSheet {
        altInteraction = game.settings.get("forbidden-lands", "alternativeSkulls");
        useHealthAndResolve = game.settings.get("forbidden-lands", "useHealthAndResolve");
        async getData() {
            let data = this.actor.toObject();
            return data = await this.#enrichTextEditorFields(data), data.items = await Promise.all(this.actor.items.map(i => i.sheet.getData())), data.items?.sort((a, b3) => (a.sort || 0) - (b3.sort || 0)), data = this.computeItems(data), data.carriedStates = this.#getCarriedStates(), data.gear = this.#filterGear(data.items), data.system.useHealthAndResolve = this.useHealthAndResolve, data.system.condition = this.actor.system.condition, data.statuses = this.actor.statuses, data
        }
        get actorData() {
            return this.actor.data
        }
        get actorProperties() {
            return this.actor.system
        }
        get rollData() {
            return this.actor.getRollData()
        }
        get config() {
            return CONFIG.fbl
        }
        async _onDrop(event, data) {
            let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
            dragData.type === "itemDrop" ? this.actor.createEmbeddedDocuments("Item", [dragData.item]) : super._onDrop(event, data)
        }
        async _onSortItem(event, itemData) {
            let state = $(event.target).closest("[data-state]")?.data("state");
            return (state || state === "") && await this.actor.updateEmbeddedDocuments("Item", [{
                _id: itemData._id,
                flags: {
                    "forbidden-lands": {
                        state: state === "none" ? "" : state
                    }
                }
            }]), super._onSortItem(event, itemData)
        }
        activateListeners(html) {
            super.activateListeners(html), !(!game.user.isGM && this.actor.limited) && (html.find(".item-create").click(ev => this.#onItemCreate(ev)), html.find(".create-dialog").click(ev => {
                this.#onCreateDialog(ev)
            }), html.find(".change-attribute").on("click contextmenu", ev => {
                let attributeName = $(ev.currentTarget).data("attribute"),
                    attribute = this.actorProperties.attribute[attributeName],
                    value = attribute.value;
                ev.type === "click" && !this.altInteraction || ev.type === "contextmenu" && this.altInteraction ? value = Math.max(value - 1, 0) : (ev.type === "contextmenu" && !this.altInteraction || ev.type === "click" && this.altInteraction) && (value = Math.min(value + 1, attribute.max)), this.actor.update({
                    [`system.attribute.${attributeName}.value`]: value
                })
            }), html.find(".change-willpower").on("click contextmenu", ev => {
                let attribute = this.actorProperties.bio.willpower,
                    value = attribute.value;
                ev.type === "click" && !this.altInteraction || ev.type === "contextmenu" && this.altInteraction ? value = Math.max(value - 1, 0) : (ev.type === "contextmenu" && !this.altInteraction || ev.type === "click" && this.altInteraction) && (value = Math.min(value + 1, attribute.max)), this.actor.update({
                    "system.bio.willpower.value": value
                })
            }), html.find(".control-gear").click(ev => {
                let direction = $(ev.currentTarget).data("direction"),
                    oppositeDirection = direction === "carried" ? "" : "carried",
                    updates = this.actor.items.filter(item => CONFIG.fbl.carriedItemTypes.includes(item.type) && item.state === oppositeDirection).map(item => ({
                        _id: item.id,
                        flags: {
                            "forbidden-lands": {
                                state: direction
                            }
                        }
                    }));
                this.actor.updateEmbeddedDocuments("Item", updates)
            }), html.find(".collapse-table").click(ev => {
                let state = $(ev.currentTarget).closest("[data-state]").data("state");
                this.actor.setFlag("forbidden-lands", `${state}-collapsed`, !this.actor.getFlag("forbidden-lands", `${state??"none"}-collapsed`))
            }), html.find(".header-sort").click(ev => {
                let state = $(ev.currentTarget).closest("[data-state]").data("state"),
                    sort = $(ev.currentTarget).data("sort");
                this.actor.setFlag("forbidden-lands", `${state??"none"}-sort`, sort)
            }), html.find(".item-edit").click(ev => {
                let div = $(ev.currentTarget).parents(".item");
                this.actor.items.get(div.data("itemId")).sheet.render(!0)
            }),
                
            html.find(".item-transfer").click(async ev => {
                let currentActorId = this.actor.id;  // ID des aktuellen Actors
                
                // Das Item-Div finden
                let div = $(ev.currentTarget).parents(".item");
                let itemId = div.data("itemId");
                let item = this.actor.items.get(itemId);
            
                // Den Ordner "Spieler" finden
                let playerFolder = game.folders.find(folder => folder.name === "Spieler" && folder.type === "Actor");
                // Den Ordner "Strongholds" finden
                let strongholdsFolder = game.folders.find(folder => folder.name === "Strongholds" && folder.type === "Actor");
            
                // Actors in den Ordnern "Spieler" und "Strongholds" filtern
                let playerActors = [];
                if (playerFolder) {
                    playerActors = game.actors.contents.filter(actor => actor.folder?.id === playerFolder.id && actor.id !== currentActorId);
                }
            
                let strongholdActors = [];
                if (strongholdsFolder) {
                    strongholdActors = game.actors.contents.filter(actor => actor.folder?.id === strongholdsFolder.id);
                }
            
                // Erstellen der Optionen für das Dropdown mit einem Trennstrich
                let playerOptions = playerActors.map(actor => `<option value="${actor.id}">${actor.name}</option>`).join("");
                let strongholdOptions = strongholdActors.map(actor => `<option value="${actor.id}">${actor.name}</option>`).join("");
                
                let options = `
                    ${playerOptions}
                    <option disabled>──────────</option>
                    ${strongholdOptions}
                `;
            
                // Prüfen, ob das Item ein "quantity"-Attribut hat, das größer als 1 ist, und entsprechendes Input-Feld vorbereiten
                let quantityInput = '';
                if (item.data.data.quantity && item.data.data.quantity > 1) {
                    quantityInput = `
                        <div class="form-group">
                            <label>Quantity to Transfer:</label>
                            <input type="number" id="quantity-input" name="quantity" min="1" max="${item.data.data.quantity}" value="${item.data.data.quantity}">
                        </div>
                    `;
                }
            
                // Ein HTML-Formular mit einem Dropdown und optionalem Quantity-Input erstellen
                let content = `
                    <form>
                        <div class="form-group">
                            <label>Transfer Item to:</label>
                            <select id="actor-select">${options}</select>
                        </div>
                        ${quantityInput}
                    </form>
                `;
            
                // Den Dialog anzeigen
                new Dialog({
                    title: "Transfer Item",
                    content: content,
                    buttons: {
                        transfer: {
                            icon: '<i class="fas fa-exchange-alt"></i>',
                            label: "Transfer",
                            callback: async html => {
                                // Den ausgewählten Actor ermitteln
                                let actorId = html.find("#actor-select").val();
                                let targetActor = game.actors.get(actorId);
            
                                if (targetActor) {
                                    // Menge ermitteln, falls das Item ein "quantity"-Attribut hat
                                    let transferQuantity = item.data.data.quantity;
                                    if (item.data.data.quantity && item.data.data.quantity > 1 && html.find("#quantity-input").length) {
                                        transferQuantity = parseInt(html.find("#quantity-input").val(), 10);
                                    }
            
                                    // Überprüfen, ob die Menge gültig ist
                                    if (transferQuantity > item.data.data.quantity) {
                                        ui.notifications.error("Die transferierte Menge kann nicht größer sein als die vorhandene Menge.");
                                        return;
                                    }
            
                                    // Eine Kopie des Items erstellen
                                    let itemData = item.toObject();
                                    if (itemData.data.quantity && transferQuantity > 1) {
                                        itemData.data.quantity = transferQuantity;
                                    }
            
                                    // Prüfung nur bei rawmaterials
                                    if (item.type === "rawmaterials") {
                                        // Prüfen, ob im Ziel-Actor bereits ein Item mit dem gleichen Namen und shelflife existiert
                                        let existingItem = targetActor.items.find(i => i.name === item.name && i.system.shelfLife === item.system.shelfLife);
                                        
                                        if (existingItem) {
                                            // Falls ein solches Item existiert, die Quantity addieren
                                            await targetActor.updateEmbeddedDocuments("Item", [{
                                                _id: existingItem.id,
                                                "data.quantity": existingItem.data.data.quantity + transferQuantity
                                            }]);
                                        } else {
                                            // Andernfalls das Item als neues Item hinzufügen
                                            await targetActor.createEmbeddedDocuments("Item", [itemData]);
                                        }
                                    } else {
                                        // Bei allen anderen Item-Typen einfach ein neues Item hinzufügen
                                        await targetActor.createEmbeddedDocuments("Item", [itemData]);
                                    }
            
                                    // Das Item aus dem aktuellen Actor entfernen oder die Menge anpassen
                                    if (!itemData.data.quantity || transferQuantity >= item.data.data.quantity) {
                                        await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
                                    } else {
                                        await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.quantity": item.data.data.quantity - transferQuantity }]);
                                    }
            
                                    // Chatnachricht senden, die den Transfer beschreibt
                                    let chatMessage = `
                                    <div style="text-align: center;">
                                        <i class="fa-solid fa-right-left" style="font-size: 42px; line-height: 42px; display: inline-block; margin-bottom: 10px"></i>
                                    </div>
                                    <div style="text-align: center;">
                                        ${transferQuantity} ${item.name} has been transferred from ${this.actor.name} to ${targetActor.name}.
                                    </div>
                                `;
                                    let gmUser = game.users.find(u => u.isGM);
                                    let whisperTo = [game.user.id, targetActor.permission.default]; // send to the acting player and the target player
                                    if (gmUser) {
                                        whisperTo.push(gmUser.id);
                                    }
            
                                    ChatMessage.create({
                                        user: game.user.id,
                                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                                        content: chatMessage
                                    });
                                }
                            }
                        },
                        cancel: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Cancel"
                        }
                    },
                    default: "transfer"
                }).render(true);
            }),


            html.find(".currency-transfer").click(async ev => {
                let currentActorId = this.actor.id;  // ID des aktuellen Actors
            
                // Den Ordner "Spieler" finden
                let playerFolder = game.folders.find(folder => folder.name === "Spieler" && folder.type === "Actor");
                // Den Ordner "Strongholds" finden
                let strongholdsFolder = game.folders.find(folder => folder.name === "Strongholds" && folder.type === "Actor");
            
                // Actors in den Ordnern "Spieler" und "Strongholds" filtern
                let playerActors = [];
                if (playerFolder) {
                    playerActors = game.actors.contents.filter(actor => actor.folder?.id === playerFolder.id && actor.id !== currentActorId);
                }
            
                let strongholdActors = [];
                if (strongholdsFolder) {
                    strongholdActors = game.actors.contents.filter(actor => actor.folder?.id === strongholdsFolder.id);
                }
            
                // Gamemaster finden
                let gmUser = game.users.find(u => u.isGM);
            
                // Erstellen der Optionen für das Dropdown mit einem Trennstrich und dem Gamemaster
                let playerOptions = playerActors.map(actor => `<option value="${actor.id}">${actor.name}</option>`).join("");
                let strongholdOptions = strongholdActors.map(actor => `<option value="${actor.id}">${actor.name}</option>`).join("");
                let gmOption = gmUser ? `<option value="gm">Gamemaster</option>` : "";
            
                let options = `
                    ${playerOptions}
                    <option disabled>──────────</option>
                    ${strongholdOptions}
                    <option disabled>──────────</option>
                    ${gmOption}
                `;
            
                // Ein HTML-Formular für die Währungsübertragung erstellen
                let content = `
                    <form>
                        <div class="form-group">
                            <label>Transfer Currency to:</label>
                            <select id="actor-select">${options}</select>
                        </div>
                        <div class="form-group">
                            <label>Gold:</label>
                            <input type="number" id="gold-input" name="gold" min="0" max="${this.actor.system.currency.gold.value}" value="0">
                        </div>
                        <div class="form-group">
                            <label>Silver:</label>
                            <input type="number" id="silver-input" name="silver" min="0" max="${this.actor.system.currency.silver.value}" value="0">
                        </div>
                        <div class="form-group">
                            <label>Copper:</label>
                            <input type="number" id="copper-input" name="copper" min="0" max="${this.actor.system.currency.copper.value}" value="0">
                        </div>
                    </form>
                `;
            
                // Den Dialog anzeigen
                new Dialog({
                    title: "Transfer Currency",
                    content: content,
                    buttons: {
                        transfer: {
                            icon: '<i class="fas fa-exchange-alt"></i>',
                            label: "Transfer",
                            callback: async html => {
                                // Den ausgewählten Actor ermitteln
                                let actorId = html.find("#actor-select").val();
                                let goldTransfer = parseInt(html.find("#gold-input").val(), 10);
                                let silverTransfer = parseInt(html.find("#silver-input").val(), 10);
                                let copperTransfer = parseInt(html.find("#copper-input").val(), 10);
            
                                // Überprüfen, ob die übertragene Menge gültig ist
                                if (goldTransfer > this.actor.system.currency.gold.value || silverTransfer > this.actor.system.currency.silver.value || copperTransfer > this.actor.system.currency.copper.value) {
                                    ui.notifications.error("Die übertragene Menge darf nicht größer sein als die vorhandene Menge.");
                                    return;
                                }
            
                                if (actorId === "gm") {
                                    // Transfer an den Gamemaster: Währungen einfach abziehen, ohne sie einem Actor gutzuschreiben
                                    await this.actor.update({
                                        "system.currency.gold.value": this.actor.system.currency.gold.value - goldTransfer,
                                        "system.currency.silver.value": this.actor.system.currency.silver.value - silverTransfer,
                                        "system.currency.copper.value": this.actor.system.currency.copper.value - copperTransfer
                                    });
            
                                    // Chatnachricht für den Transfer an den Gamemaster
                                    let chatMessage = `
                                        <div style="text-align: center;">
                                            <i class="fa-solid fa-right-left" style="font-size: 42px; line-height: 42px; display: inline-block; margin-bottom: 10px"></i>
                                        </div>
                                        <div style="text-align: center;">
                                            ${goldTransfer} Gold, ${silverTransfer} Silver, and ${copperTransfer} Copper have been transferred from ${this.actor.name} to the Gamemaster.
                                        </div>
                                    `;
            
                                    ChatMessage.create({
                                        user: game.user.id,
                                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                                        content: chatMessage
                                    });
            
                                } else {
                                    // Transfer an einen anderen Actor
                                    let targetActor = game.actors.get(actorId);
            
                                    if (targetActor) {
                                        // Währungen beim Ziel-Schauspieler hinzufügen
                                        await targetActor.update({
                                            "system.currency.gold.value": targetActor.system.currency.gold.value + goldTransfer,
                                            "system.currency.silver.value": targetActor.system.currency.silver.value + silverTransfer,
                                            "system.currency.copper.value": targetActor.system.currency.copper.value + copperTransfer
                                        });
            
                                        // Währungen beim aktuellen Schauspieler abziehen
                                        await this.actor.update({
                                            "system.currency.gold.value": this.actor.system.currency.gold.value - goldTransfer,
                                            "system.currency.silver.value": this.actor.system.currency.silver.value - silverTransfer,
                                            "system.currency.copper.value": this.actor.system.currency.copper.value - copperTransfer
                                        });
            
                                        // Chatnachricht für den Transfer an den Ziel-Schauspieler
                                        let chatMessage = `
                                            <div style="text-align: center;">
                                                <i class="fa-solid fa-right-left" style="font-size: 42px; line-height: 42px; display: inline-block; margin-bottom: 10px"></i>
                                            </div>
                                            <div style="text-align: center;">
                                                ${goldTransfer} Gold, ${silverTransfer} Silver, and ${copperTransfer} Copper have been transferred from ${this.actor.name} to ${targetActor.name}.
                                            </div>
                                        `;
            
                                        ChatMessage.create({
                                            user: game.user.id,
                                            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                                            content: chatMessage
                                        });
                                    }
                                }
                            }
                        },
                        cancel: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Cancel"
                        }
                    },
                    default: "transfer"
                }).render(true);
            }),


            html.find(".consumables-transfer").click(async ev => {
                let currentActorId = this.actor.id;  // ID des aktuellen Actors
            
                // Den Ordner "Spieler" finden
                let playerFolder = game.folders.find(folder => folder.name === "Spieler" && folder.type === "Actor");
                // Den Ordner "Strongholds" finden
                let strongholdsFolder = game.folders.find(folder => folder.name === "Strongholds" && folder.type === "Actor");
            
                // Actors in den Ordnern "Spieler" und "Strongholds" filtern
                let playerActors = [];
                if (playerFolder) {
                    playerActors = game.actors.contents.filter(actor => actor.folder?.id === playerFolder.id && actor.id !== currentActorId);
                }
            
                let strongholdActors = [];
                if (strongholdsFolder) {
                    strongholdActors = game.actors.contents.filter(actor => actor.folder?.id === strongholdsFolder.id);
                }
            
                // Gamemaster finden
                let gmUser = game.users.find(u => u.isGM);
            
                // Erstellen der Optionen für das Dropdown mit einem Trennstrich und dem Gamemaster
                let playerOptions = playerActors.map(actor => `<option value="${actor.id}">${actor.name}</option>`).join("");
                let strongholdOptions = strongholdActors.map(actor => `<option value="${actor.id}">${actor.name}</option>`).join("");
                let gmOption = gmUser ? `<option value="gm">Gamemaster</option>` : "";
            
                let options = `
                    ${playerOptions}
                    <option disabled>──────────</option>
                    ${strongholdOptions}
                    <option disabled>──────────</option>
                    ${gmOption}
                `;
            
                // Dropdown-Auswahl für Mengen generieren mit dem aktuellen maximalen Wert des Consumables
                function createDropdownOptions(maxValue, currentValue) {
                    let dropdownOptions = "";
                    for (let i = 0; i <= Math.min(maxValue, 4 - currentValue); i++) {
                        dropdownOptions += `<option value="${i}" ${i === 0 ? "selected" : ""}>${i}</option>`;
                    }
                    return dropdownOptions;
                }
            
                // Ein HTML-Formular für die Consumables-Übertragung erstellen
                let content = `
                    <form>
                        <div class="form-group">
                            <label>Transfer Consumables to:</label>
                            <select id="actor-select">${options}</select>
                        </div>
                        <div class="form-group">
                            <label>Arrows:</label>
                            <select id="arrows-select">
                                ${createDropdownOptions(this.actor.system.consumable.arrows.value, 0)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Food:</label>
                            <select id="food-select">
                                ${createDropdownOptions(this.actor.system.consumable.food.value, 0)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Torches:</label>
                            <select id="torches-select">
                                ${createDropdownOptions(this.actor.system.consumable.torches.value, 0)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Water:</label>
                            <select id="water-select">
                                ${createDropdownOptions(this.actor.system.consumable.water.value, 0)}
                            </select>
                        </div>
                    </form>
                `;
            
                // Den Dialog anzeigen
                new Dialog({
                    title: "Transfer Consumables",
                    content: content,
                    buttons: {
                        transfer: {
                            icon: '<i class="fas fa-exchange-alt"></i>',
                            label: "Transfer",
                            callback: async html => {
                                // Den ausgewählten Actor ermitteln
                                let actorId = html.find("#actor-select").val();
                                let arrowsTransfer = parseInt(html.find("#arrows-select").val(), 10);
                                let foodTransfer = parseInt(html.find("#food-select").val(), 10);
                                let torchesTransfer = parseInt(html.find("#torches-select").val(), 10);
                                let waterTransfer = parseInt(html.find("#water-select").val(), 10);
            
                                let targetActor = actorId !== "gm" ? game.actors.get(actorId) : null;
            
                                // Überprüfen, ob die übertragene Menge gültig ist (nicht mehr als 4 beim Ziel)
                                if (targetActor) {
                                    if ((targetActor.system.consumable.arrows.value + arrowsTransfer > 4) || 
                                        (targetActor.system.consumable.food.value + foodTransfer > 4) || 
                                        (targetActor.system.consumable.torches.value + torchesTransfer > 4) || 
                                        (targetActor.system.consumable.water.value + waterTransfer > 4)) {
                                        ui.notifications.error("Das Ziel kann nicht mehr als 4 von einem Consumable haben.");
                                        return;
                                    }
                                }
            
                                // Überprüfen, ob die übertragene Menge gültig ist
                                if (arrowsTransfer > this.actor.system.consumable.arrows.value || 
                                    foodTransfer > this.actor.system.consumable.food.value || 
                                    torchesTransfer > this.actor.system.consumable.torches.value || 
                                    waterTransfer > this.actor.system.consumable.water.value) {
                                    ui.notifications.error("Die übertragene Menge darf nicht größer sein als die vorhandene Menge.");
                                    return;
                                }
            
                                if (actorId === "gm") {
                                    // Transfer an den Gamemaster: Consumables einfach abziehen, ohne sie einem Actor gutzuschreiben
                                    await this.actor.update({
                                        "system.consumable.arrows.value": this.actor.system.consumable.arrows.value - arrowsTransfer,
                                        "system.consumable.food.value": this.actor.system.consumable.food.value - foodTransfer,
                                        "system.consumable.torches.value": this.actor.system.consumable.torches.value - torchesTransfer,
                                        "system.consumable.water.value": this.actor.system.consumable.water.value - waterTransfer
                                    });
            
                                    // Chatnachricht für den Transfer an den Gamemaster
                                    let chatMessage = `
                                        <div style="text-align: center;">
                                            <i class="fa-solid fa-right-left" style="font-size: 42px; line-height: 42px; display: inline-block; margin-bottom: 10px"></i>
                                        </div>
                                        <div style="text-align: center;">
                                            ${arrowsTransfer} Arrows, ${foodTransfer} Food, ${torchesTransfer} Torches, and ${waterTransfer} Water have been transferred from ${this.actor.name} to the Gamemaster.
                                        </div>
                                    `;
            
                                    ChatMessage.create({
                                        user: game.user.id,
                                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                                        content: chatMessage
                                    });
            
                                } else {
                                    // Transfer an einen anderen Actor
                                    if (targetActor) {
                                        // Consumables beim Ziel-Schauspieler hinzufügen
                                        await targetActor.update({
                                            "system.consumable.arrows.value": targetActor.system.consumable.arrows.value + arrowsTransfer,
                                            "system.consumable.food.value": targetActor.system.consumable.food.value + foodTransfer,
                                            "system.consumable.torches.value": targetActor.system.consumable.torches.value + torchesTransfer,
                                            "system.consumable.water.value": targetActor.system.consumable.water.value + waterTransfer
                                        });
            
                                        // Consumables beim aktuellen Schauspieler abziehen
                                        await this.actor.update({
                                            "system.consumable.arrows.value": this.actor.system.consumable.arrows.value - arrowsTransfer,
                                            "system.consumable.food.value": this.actor.system.consumable.food.value - foodTransfer,
                                            "system.consumable.torches.value": this.actor.system.consumable.torches.value - torchesTransfer,
                                            "system.consumable.water.value": this.actor.system.consumable.water.value - waterTransfer
                                        });
            
                                        // Chatnachricht für den Transfer an den Ziel-Schauspieler
                                        let chatMessage = `
                                            <div style="text-align: center;">
                                                <i class="fa-solid fa-right-left" style="font-size: 42px; line-height: 42px; display: inline-block; margin-bottom: 10px"></i>
                                            </div>
                                            <div style="text-align: center;">
                                                ${arrowsTransfer} Arrows, ${foodTransfer} Food, ${torchesTransfer} Torches, and ${waterTransfer} Water have been transferred from ${this.actor.name} to ${targetActor.name}.
                                            </div>
                                        `;
            
                                        ChatMessage.create({
                                            user: game.user.id,
                                            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                                            content: chatMessage
                                        });
                                    }
                                }
                            }
                        },
                        cancel: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Cancel"
                        }
                    },
                    default: "transfer"
                }).render(true);
            }),
            
            
            
            
            
                  
            
            
            html.find(".item-delete").click(ev => {
                let div = $(ev.currentTarget).parents(".item");
                this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]), div.slideUp(200, () => this.render(!1))
            }), html.find(".item-post").click(ev => {
                let div = $(ev.currentTarget).parents(".item");
                this.actor.items.get(div.data("itemId")).sendToChat()
            }), html.find(".change-item-bonus").on("click contextmenu", ev => {
                let itemId = $(ev.currentTarget).data("itemId"),
                    item = this.actor.items.get(itemId),
                    value = item.system.bonus.value;
                ev.type === "click" && !this.altInteraction || ev.type === "contextmenu" && this.altInteraction ? value = Math.max(value - 1, 0) : (ev.type === "contextmenu" && !this.altInteraction || ev.type === "click" && this.altInteraction) && (value = Math.min(value + 1, item.itemProperties.bonus.max)), item.update({
                    "system.bonus.value": value
                })
            }), html.find(".roll-attribute").click(ev => {
                let attributeName = $(ev.currentTarget).data("attribute");
                return this.rollAttribute(attributeName)
            }), html.find(".roll-skill").click(ev => {
                let skillName = $(ev.currentTarget).data("skill");
                return this.rollSkill(skillName)
            }), html.find(".roll-weapon").click(ev => {
                let itemId = $(ev.currentTarget).data("itemId");
                return this.rollGear(itemId)
            }), html.find(".roll-spell").click(ev => {
                let itemId = $(ev.currentTarget).data("itemId");
                return this.rollSpell(itemId)
            }), html.find(".roll-action").click(ev => {
                let rollName = $(ev.currentTarget).data("action"),
                    itemId = $(ev.currentTarget).data("itemId");
                return this.rollAction(rollName, itemId || null)
            }), html.find(".quantity").on("blur", ev => {
                let itemId = ev.currentTarget.parentElement.parentElement.dataset.itemId ?? ev.currentTarget.parentElement.dataset.itemId;
                if (!itemId) throw ui.notifications.notify("ERROR.NO_ID", "error", {
                    localize: !0
                }), new Error("No item id found");
                this.actor.updateEmbeddedDocuments("Item", [{
                    _id: itemId,
                    "system.quantity": ev.currentTarget.value
                }])
            }))
        }
        computeEncumbrance(data) {
            let weightCarried = 0;
            for (let item of Object.values(data.items)) weightCarried += this.computeItemEncumbrance(item);
            if (this.actor.type === "character") {
                for (let consumable of Object.values(data.system.consumable)) {
                    if (consumable.label !== 'CONSUMABLE.HYGIENE') {
                        weightCarried += consumable.value * 0.25;
                    }
                }
                let coinsCarried = Number.parseInt(data.system.currency.gold.value) + Number.parseInt(data.system.currency.silver.value) + Number.parseInt(data.system.currency.copper.value);
                weightCarried = (weightCarried + Math.floor(coinsCarried / 100) * 0.5).toFixed(2);
            }
            let baseEncumbrance = data.system.attribute.strength.max * 2,
                monsterEncumbranceMultiplier = this.actor.type === "monster" ? data.system.isMounted ? 1 : 2 : 1,
                modifiers = this.actor.getRollModifierOptions("carryingCapacity"),
                weightAllowed = baseEncumbrance * monsterEncumbranceMultiplier + modifiers.reduce((acc, m) => acc + Number.parseInt(m?.value || 0), 0);
            return data.system.encumbrance = {
                value: weightCarried,
                max: weightAllowed,
                over: weightCarried > weightAllowed
            }, data
        }
        broken(type) {
            let msg = type === "item" ? "WARNING.ITEM_BROKEN" : "WARNING.ACTOR_BROKEN";
            return ui.notifications.warn(msg, {
                localize: !0
            }), new Error(locmsg)
        }
        getRollOptions(...rollIdentifiers) {
            return {
                ...this.rollData,
                modifiers: this.actor.getRollModifierOptions(...rollIdentifiers)
            }
        }
        getAttribute(identifier) {
            let attributeName = CONFIG.fbl.skillAttributeMap[identifier] || identifier,
                attribute = this.actor.attributes[attributeName];
            return attribute ? {
                name: attributeName,
                ...attribute
            } : {}
        }
        getSkill(identifier) {
            let skillName = CONFIG.fbl.actionSkillMap[identifier] || identifier,
                skill = this.actor.skills[skillName];
            if (!skill) return {};
            let attribute = this.getAttribute(skillName);
            return {
                skill: {
                    name: skillName,
                    ...skill
                },
                attribute: {
                    ...attribute
                }
            }
        }
        getGears() {
            return this.actor.items.filter(item => item.type === "gear" && !item.isBroken)
        }
        getGear(itemId) {
            let gear = this.actor.items.get(itemId).getRollData();
            if (gear.isBroken) throw this.broken("item");
            let properties = this.getSkill(CONFIG.fbl.actionSkillMap[gear.category] || "melee");
            return {
                gear,
                ...properties
            }
        }
        rollAction(actionName, itemId = void 0) {
            if (!this.actor.canAct) throw this.broken();
            let properties = itemId ? this.getGear(itemId) : this.getSkill(actionName),
                data = {
                    title: actionName,
                    ...properties
                };
            itemId && (data.gear.damage = void 0);
            let options = {
                ...this.getRollOptions(actionName, data.skill?.name, data.attribute?.name, data.gear?.itemId)
            };
            return actionName === "unarmed" && (options.damage = 1), FBLRollHandler.createRoll(data, {
                ...options,
                gears: this.getGears()
            })
        }
        rollArmor() {
            let rollName = `${localizeString("ITEM.TypeArmor")}: ${localizeString("ARMOR.TOTAL")}`,
                identifiers = ["armor"],
                artifactDies = [],
                totalArmor = this.actor.itemTypes.armor.reduce((sum, armor) => {
                    if (armor.itemProperties.part === "shield" || armor.state !== "equipped") return sum;
                    let rollData = armor.getRollData(),
                        value = armor.itemProperties.bonus.value;
                    return rollData.artifactDie && artifactDies.push(rollData.artifactDie), identifiers.push(armor.id), sum + value
                }, 0),
                data = {
                    title: rollName,
                    gear: {
                        label: localizeString("ITEM.TypeArmor"),
                        name: localizeString("ITEM.TypeArmor"),
                        value: totalArmor,
                        artifactDie: artifactDies.join("+")
                    }
                },
                options = {
                    maxPush: "0",
                    ...this.getRollOptions(...identifiers)
                };
            return !!totalArmor || !!artifactDies.length || !!options.modifiers.length ? FBLRollHandler.createRoll(data, {
                ...options,
                gears: this.getGears()
            }) : ui.notifications.warn("WARNING.NO_ARMOR", {
                localize: !0
            })
        }
        rollSpecificArmor(armorId) {
            let rollData = this.actor.items.get(armorId).getRollData(),
                rollName = `${localizeString("ITEM.TypeArmor")}: ${rollData.name}`;
            if (rollData.isBroken) throw this.broken("item");
            let data = {
                    title: rollName,
                    gear: rollData
                },
                options = {
                    maxPush: "0",
                    ...this.getRollOptions("armor", armorId)
                };
            return FBLRollHandler.createRoll(data, {
                ...options,
                gears: this.getGears()
            })
        }
        rollAttribute(attrName) {
            if (!this.actor.canAct) throw this.broken();
            let data = {
                    title: attrName,
                    attribute: this.getAttribute(attrName)
                },
                options = {
                    ...this.getRollOptions(attrName)
                };
            return FBLRollHandler.createRoll(data, {
                ...options,
                gears: this.getGears()
            })
        }
        rollGear(itemId) {
            if (!this.actor.canAct) throw this.broken();
            let properties = this.getGear(itemId),
                data = {
                    title: properties.gear.name,
                    ...properties
                },
                options = {
                    ...this.getRollOptions(data.skill?.name, data.attribute?.name, data.gear.itemId)
                };
            return FBLRollHandler.createRoll(data, {
                ...options,
                gears: this.getGears()
            })
        }
        rollSkill(skillName) {
            if (!this.actor.canAct) throw this.broken();
            let data = {
                    title: skillName,
                    ...this.getSkill(skillName)
                },
                options = {
                    ...this.getRollOptions(skillName, data.attribute?.name)
                };
            return FBLRollHandler.createRoll(data, {
                ...options,
                gears: this.getGears()
            })
        }
        rollSpell(spellId) {
            if (!this.actor.canAct) throw this.broken();

            if (this.actor.willpower.value === 0) {
                ui.notifications.warn("Zauber kann nicht gewirkt werden, da kein Willenskraftwert mehr übrig ist.");
                return; // Funktion wird abgebrochen, wenn der Wert 0 ist
            }
        


            if (!this.actor.willpower.value && !this.actorProperties.subtype?.type === "npc") throw ui.notifications.warn("WARNING.NO_WILLPOWER", {
                localize: !0
            });
            let spell = this.actor.items.get(spellId),
                {
                    value
                } = duplicate(this.actor.willpower),
                hasPsych = !!this.actor.items.getName("Psychic Power (Half-Elf)"),
                data = {
                    title: spell.name,
                    attribute: {
                        name: spell.name,
                        value: 1
                    },
                    spell: {
                        willpower: {
                            max: --value,
                            value
                        },
                        psych: hasPsych,
                        item: spell
                    }
                };
            this.actorProperties.subtype?.type === "npc" && (data.spell.willpower = {
                    max: 9,
                    value: 9
            });
            let options = {
                maxPush: "0",
                template: "systems/forbidden-lands/templates/components/roll-engine/spell-dialog.hbs",
                type: "spell",
                skulls: this.altInteraction,
                ...this.getRollOptions()
            };
            return FBLRollHandler.createRoll(data, {
                ...options,
                gears: this.getGears()
            })
        }
        async _renderInner(data, options) {
            return data.alternativeSkulls = this.altInteraction, super._renderInner(data, options)
        }
        computeSkills(data) {
            for (let skill of Object.values(data.system.skill)) skill[`has${skill?.attribute?.capitalize()}`] = !1, CONFIG.fbl.attributes.includes(skill.attribute) && (skill[`has${skill.attribute.capitalize()}`] = !0);
            return data
        }
        computeItems(data) {
            for (let item of Object.values(data.items)) item.system.part === "shield" ? item.isWeapon = !0 : CONFIG.fbl.itemTypes.includes(item.type) && (item[`is${item.type.capitalize()}`] = !0), item.isEquipped = item.flags?.state === "equipped", item.isCarried = item.flags?.state === "carried";
            return data
        }
        computeItemEncumbrance(data) {
            let type = data.type,
                weight = Number.isNaN(Number(data?.system.weight)) ? this.config.encumbrance[data?.system.weight] ?? 1 : Number(data?.system.weight) ?? 1;
                return data.flags?.state 
                ? ["gear", "armor", "weapon", "rawMaterial"].includes(type) 
                ? weight * Number(data.system.quantity) 
                    : 0 
                : 0;
        }
        async #enrichTextEditorFields(data) {
            let fields = CONFIG.fbl.enrichedActorFields;
            for (let field of fields) data.system.bio?.[field]?.value && (data.system.bio[field].value = await TextEditor.enrichHTML(data.system.bio[field].value, {
                async: !0
            }));
            return data
        }
        #getCarriedStates() {
            return CONFIG.fbl.carriedStates.map(state => ({
                name: state,
                collapsed: this.actor.getFlag("forbidden-lands", `${state}-collapsed`)
            }))
        }
        #getSortKey(state) {
            return this.actor.getFlag("forbidden-lands", `${state??"none"}-sort`) || "name"
        }
        #sortGear(a, b3, key) {
            switch (key) {
                case "name":
                case "type":
                    return a[key]?.toLocaleLowerCase().localeCompare(b3[key]?.toLocaleLowerCase()) ?? 0;
                case "attribute": {
                    let aComp = a.type === "rawMaterial" ? a.system.quantity : a.system.bonus.value,
                        bComp = b3.type === "rawMaterial" ? b3.system.quantity : b3.system.bonus.value;
                    return Number(bComp) - Number(aComp)
                }
                case "weight": {
                    let weightMap = CONFIG.fbl.encumbrance,
                        aWeight = a.type === "rawMaterial" ? Number(a.system.quantity) : Math.floor(weightMap[a.system.weight] || 0);
                    return (b3.type === "rawMaterial" ? Number(b3.system.quantity) : Math.floor(weightMap[b3.system.weight] || 0)) - aWeight
                }
            }
        }
        #filterGear(items) {
            let reduced = (items?.filter(({
                type
            }) => CONFIG.fbl.carriedItemTypes.includes(type)).map(item => ({
                ...item,
                state: item.flags?.state || "none"
            }))).reduce((acc, item) => {
                let {
                    state
                } = item;
                return acc[state] || (acc[state] = []), acc[state].push(item), acc
            }, {});
            return Object.fromEntries(Object.entries(reduced).map(([key, arr]) => [key, arr.sort((a, b3) => this.#sortGear(a, b3, this.#getSortKey(key)))]))
        }
        #onItemCreate(event) {
            let itemType = $(event.currentTarget).data("type"),
                label = CONFIG.fbl.i18n[itemType];
            this.actor.createEmbeddedDocuments("Item", {
                name: `${game.i18n.localize(label)}`,
                type: itemType
            }, {
                renderSheet: !0
            })
        }
        async #onCreateDialog(event) {
            event.preventDefault();
            let state = $(event.target).closest("[data-state]")?.data("state");
            Hooks.once("renderDialog", (_2, html) => html.find("option").filter((_i, el) => ["criticalInjury", "building", "hireling", "monsterAttack", "monsterTalent", "spell", "talent"].includes(el.value)).remove());
            let item = await Item.createDialog({}, {
                parent: this.actor
            });
            item && item.setFlag("forbidden-lands", "state", state === "none" ? "" : state)
        }
    };


    var ForbiddenLandsCharacterSheet = class ForbiddenLandsCharacterSheet extends ForbiddenLandsActorSheet {
        static get defaultOptions() {
            let useHealthAndResolve = game.settings.get("forbidden-lands", "useHealthAndResolve");
            return mergeObject(super.defaultOptions, {
                classes: ["forbidden-lands", "sheet", "actor"],
                width: 660,
                height: useHealthAndResolve ? 790 : 740,
                resizable: !0,
                scrollY: [".armors .item-list .items", ".critical-injuries .item-list .items", ".gears .item-list .items", ".spells .item-list .items", ".talents .item-list .items", ".weapons .item-list .items"],
                tabs: [{
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main"
                }]
            });
        }

        get template() {
            return !game.user.isGM && this.actor.limited ? "systems/forbidden-lands/templates/actor/character/character-limited-sheet.hbs" : this.actorProperties.subtype?.type === "npc" ? "systems/forbidden-lands/templates/actor/character/npc-sheet.hbs" : "systems/forbidden-lands/templates/actor/character/character-sheet.hbs";
        }

        async getData() {
            let actorData = await super.getData();
            return actorData = this.computeSkills(actorData), actorData = this.computeEncumbrance(actorData), actorData;
        }

        activateListeners(html) {
            super.activateListeners(html);

            // Monitor changes in currency buttons
            html.find(".currency-button").on("click contextmenu", ev => {
                this.updateCurrency(ev);
            });

            // Monitor direct input changes in currency fields
            html.find("input[name^='system.currency']").on("change", ev => {
                this.updateCurrency(ev, true);
            });

            html.find(".condition").click(async ev => {
                let conditionName = $(ev.currentTarget).data("condition");
                this.actor.toggleCondition(conditionName), this._render();
            });

            html.find(".roll-armor.specific").click(ev => {
                let itemId = $(ev.currentTarget).data("itemId");
                this.rollSpecificArmor(itemId);
            });

            html.find(".roll-armor.total").click(() => this.rollArmor());

            html.find(".roll-consumable").click(ev => {
                let consumable = $(ev.currentTarget).data("consumable");
                return this.rollConsumable(consumable);
            });

            html.find(".roll-reputation").click(() => this.rollReputation());
            html.find(".roll-pride").click(() => this.rollPride());
        }

        async updateCurrency(ev, isInput = false) {
            if (isInput) {
                // Wenn die Änderung aus Eingabefeldern kommt
                let fieldName = ev.target.name;
                let newValue = parseInt(ev.target.value);
                let oldValue = getProperty(this.actor.data, fieldName);
        
                await this.actor.update({
                    [fieldName]: newValue
                });
        
                // Blinde Nachricht an den GM senden
                let currencyType = fieldName.split('.')[2];
                let messageContent = `<span style="color: red;">${this.actor.name} hat die Währung geändert: ${currencyType.charAt(0).toUpperCase() + currencyType.slice(1)} von ${oldValue} auf ${newValue}</span>`;
                ChatMessage.create({
                    content: messageContent,
                    whisper: ChatMessage.getWhisperRecipients("GM"),
                    blind: true  // Macht die Nachricht blind
                });
            } else {
                // Wenn die Änderung durch Buttons kommt
                let currency = $(ev.currentTarget).data("currency");
                let operator = $(ev.currentTarget).data("operator");
                let modifier = ev.type === "contextmenu" ? 5 : 1;
                let coins = [this.actor.actorProperties.currency.gold.value, this.actor.actorProperties.currency.silver.value, this.actor.actorProperties.currency.copper.value];
                let i = {
                    gold: 0,
                    silver: 1,
                    copper: 2
                } [currency];
                if (operator === "plus") coins[i] += modifier;
                else
                    for (coins[i] -= modifier; i >= 0; --i) coins[i] < 0 && i > 0 && (coins[i - 1] -= 1, coins[i] += 10);
                coins[0] >= 0 && await this.actor.update({
                    "system.currency.gold.value": coins[0],
                    "system.currency.silver.value": coins[1],
                    "system.currency.copper.value": coins[2]
                });
            }
        }
        

        async rollConsumable(identifier) {
            let consumable = this.actor.consumables[identifier];
            if (!consumable.value) return ui.notifications.warn("WARNING.NO_CONSUMABLE", { localize: true });
            
            let rollName = localizeString(consumable.label),
                dice = CONFIG.fbl.consumableDice[consumable.value],
                options = {
                    name: rollName.toLowerCase(),
                    maxPush: "0",
                    consumable: identifier,
                    type: "consumable",
                    ...this.getRollOptions()
                },
                rolls = [];
        
            if (identifier === "food" || identifier === "water") {
                rolls.push(FBLRoll.create(`${dice}[${rollName}]`, {}, options));
        
                // Set a flag to track that the actor has rolled for food or water
                await this.actor.setFlag('forbidden-lands', `${identifier}Rolled`, true);
            } else {
                dice = CONFIG.fbl.consumableDiceTorches[consumable.value],
                rolls.push(FBLRoll.create(`${dice}[${rollName}]`, {}, options));
            }

            let healamount = 0
            let diceAmaount

            for (let roll of rolls) {
                await roll.roll({ async: true });
                let message = await roll.toMessage();
                let threshold = game.settings.get("forbidden-lands", "autoDecreaseConsumable") || 0;

                let decreasecount = 0
                diceAmaount = roll.dice[0].results.length

                for (let consumableresult of roll.dice[0].results) {
                    if (Number(consumableresult.result) <= threshold) {
                        decreasecount = decreasecount +1
                    }
                    if (Number(consumableresult.result) === 6) {
                        healamount = healamount +1
                    }
                }

                FBLRollHandler.decreaseConsumable(message.id, decreasecount);
               
            }
            if (identifier === "food") {
                if (!(this.actor.system.condition.hungry.value === true) && !(this.actor.system.condition.thirsty.value === true) && !(this.actor.system.condition.cold.value === true)) {
                    let currentStrength = this.actor.system.attribute.strength.value;
                    if (this.actor.system.attribute.strength.value < this.actor.system.attribute.strength.max) {
                        await this.actor.update({ "system.attribute.strength.value": currentStrength + 1 + healamount });
                    }
                    // ChatMessage.create({
                    //     content: this.object.name + ' healed ' + (healamount + 1) + ' point(s) in strength.',
                    //     speaker: { actor: this.actor }
                    // });
                } else {
                    ChatMessage.create({
                        content: 'Conditions are blocking strength recovery.',
                        speaker: { actor: this.actor }
                    });
                }
            }
            if (identifier === "water") {
                if (!(this.actor.system.condition.thirsty.value === true)) { 
                    let currentAgility = this.actor.system.attribute.agility.value;
                    if (this.actor.system.attribute.agility.value < this.actor.system.attribute.agility.max) {
                        await this.actor.update({ "system.attribute.agility.value": currentAgility + 1 + healamount });
                    }
                    // ChatMessage.create({
                    //     content: this.object.name + ' healed ' + (healamount + 1) + ' point(s) in agility.',
                    //     speaker: { actor: this.actor }
                    // });
                } else {
                    ChatMessage.create({
                        content: 'Conditions are blocking agility recovery.',
                        speaker: { actor: this.actor }
                    });
                }
            }
        }
        

        async rollPride() {
            if (!this.actor.canAct) throw this.broken();
            let pride = this.actor.actorProperties.bio.pride,
                rollName = localizeString(pride.label),
                options = {
                    name: rollName,
                    flavor: `<span class="chat-flavor">${pride.value}</span>`,
                    maxPush: "0",
                    ...this.getRollOptions()
                },
                roll = FBLRoll.create(`${CONFIG.fbl.prideDice}[${rollName}]`, {}, options);
            await roll.roll({
                async: !0
            });
            return roll.toMessage();
        }

        async rollReputation() {
            let reputation = this.actor.actorProperties.bio.reputation,
                rollName = localizeString(reputation.label),
                options = {
                    name: rollName,
                    flavor: `<span class="chat-flavor">${reputation.value}</span>`,
                    maxPush: "0",
                    ...this.getRollOptions()
                },
                roll = FBLRoll.create(`${reputation.value}db[${rollName}]`, {}, options);
            await roll.roll({
                async: !0
            });
            return roll.toMessage();
        }

        async _charGen() {
            return (await new ForbiddenLandsCharacterGenerator(await ForbiddenLandsCharacterGenerator.loadDataset(), this.actor)).render(!0);
        }

        _onConfigureSheet(event) {
            event.preventDefault();
            new ActorSheetConfig(this.actor, {
                top: this.position.top + 40,
                left: this.position.left + (this.position.width - 400) / 2
            }).render(!0);
        }

        _getHeaderButtons() {
            let buttons = super._getHeaderButtons();
            return this.actor.isOwner && (buttons = [{
                    label: game.i18n.localize("SHEET.HEADER.REST"),
                    class: "rest-up",
                    icon: "fas fa-bed",
                    onclick: () => this.actor.rest()
                }
                // {
                //     label: game.i18n.localize("SHEET.HEADER.CHAR_GEN"),
                //     class: "char-gen",
                //     icon: "fas fa-leaf",
                //     onclick: async () => {
                //         Object.values(this.actor.actorProperties.attribute).flatMap(a => a.value + a.max).some(v2 => v2 > 0) ? Dialog.confirm({
                //             title: game.i18n.localize("FLCG.TITLE"),
                //             content: `
                //                 <h2 style="text-align: center;font-weight: 600; border:none;">${game.i18n.localize("FLCG.WARNING")}</h2>
                //                 <p>${game.i18n.localize("FLCG.WARNING_DESTRUCTIVE_EDIT")}</p><hr/>
                //                 <p>${game.i18n.localize("FLCG.WARNING_HINT")}</p>
                //                 <p style="text-align: center;"><b>${game.i18n.localize("FLCG.WARNING_ARE_YOU_SURE")}</b></p>
                //                 <br/>`,
                //             yes: async () => await this._charGen(),
                //             no: () => { },
                //             defaultYes: !1
                //         }) : await this._charGen();
                //     }
                // }

            ].concat(buttons)), buttons;
        }

    };


    init_define_GLOBALPATHS();
    var ForbiddenLandsMonsterSheet = class extends ForbiddenLandsActorSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                classes: ["forbidden-lands", "sheet", "actor"],
                template: "systems/forbidden-lands/templates/actor/monster/monster-sheet.hbs",
                width: 700,
                height: 770,
                resizable: !0,
                scrollY: [".monster-talents .item-list .items", ".monster-attacks .item-list .items", ".gears.item-list .items"],
                tabs: [{
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main"
                }]
            })
        }
        async getData() {
            let actorData = await super.getData();
            return this.computeSkills(actorData), this.computeItems(actorData), this.computeEncumbrance(actorData), actorData
        }
        activateListeners(html) {
            super.activateListeners(html), html.find(".roll-armor").click(ev => this.rollArmor() && ev.target.blur()), html.find("#monster-attack-btn").click(() => this.rollAttack()), html.find(".roll-attack").click(ev => {
                let itemId = $(ev.currentTarget).data("itemId");
                return this.rollSpecificAttack(itemId)
            }), html.find(".change-mounted").click(() => {
                let boolean = this.actor.actorProperties.isMounted;
                this.actor.update({
                    "system.isMounted": !boolean
                })
            })
        }
        async rollAttack() {
            let attacks = this.actor.itemTypes.monsterAttack,
                roll = await new Roll(`1d${attacks.length}`).roll({
                    async: !0
                }),
                attack = attacks[Number.parseInt(roll.result) - 1];
            attack.sendToChat(), this.rollSpecificAttack(attack.id)
        }
        async rollSpecificAttack(attackId) {
            if (!this.actor.canAct) throw this.broken();
            let attack = this.actor.items.get(attackId);
            if (attack.type !== "monsterAttack") return this.rollGear(attackId);
            let gear = attack.getRollData(),
                rollOptions = this.getRollOptions(),
                options = {
                    name: attack.name,
                    maxPush: rollOptions.unlimitedPush ? 1e4 : "0",
                    isAttack: !0,
                    isMonsterAttack: !0,
                    damage: Number(attack.damage || 0),
                    gear,
                    ...rollOptions
                },
                dice = attack.itemProperties.usingStrength ? this.actor.attributes.strength.value : attack.itemProperties.dice,
                roll = FBLRoll.create(`${dice}db[${attack.name}]`, {}, options);
            return await roll.roll({
                async: !0
            }), roll.toMessage()
        }
        async rollArmor() {
            let armor = this.actorProperties.armor,
                rollName = `${localizeString("ITEM.TypeArmor")}: ${this.actor.name}`,
                options = {
                    name: rollName,
                    maxPush: "0",
                    ...this.getRollOptions()
                },
                roll = FBLRoll.create(`${armor.value}dg[${rollName}]`, {}, options);
            return await roll.roll({
                async: !0
            }), roll.toMessage(), !0
        }
        _getHeaderButtons() {
            let buttons = super._getHeaderButtons();
            return this.actor.isOwner && (buttons = [{
                label: game.i18n.localize("SHEET.HEADER.REST"),
                class: "rest-up",
                icon: "fas fa-bed",
                onclick: () => this.actor.rest()
            }, {
                label: game.i18n.localize("SHEET.HEADER.ROLL"),
                class: "custom-roll",
                icon: "fas fa-dice",
                onclick: () => this.rollAction("ACTION.GENERIC")
            }].concat(buttons)), buttons
        }
    };
    init_define_GLOBALPATHS();




    // var ForbiddenLandsStrongholdSheet = class extends ForbiddenLandsActorSheet {
    //     static get defaultOptions() {
    //         return mergeObject(super.defaultOptions, {
    //             classes: ["forbidden-lands", "sheet", "actor"],
    //             template: "systems/forbidden-lands/templates/actor/stronghold/stronghold-sheet.hbs",
    //             width: 650,
    //             height: 700,
    //             resizable: true,
    //             scrollY: [".buildings.item-list .items", ".hirelings.item-list .items", ".gears.item-listing .items"],
    //             tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "building" }]
    //         });
    //     }

    //     async getData() {
    //         let actorData = await super.getData();
    //         actorData.system.description = await TextEditor.enrichHTML(actorData.system.description, { async: true });
    //         this._computeItems(actorData);
    //         return actorData;
    //     }

    //     _computeItems(data) {
    //         for (let item of Object.values(data.items)) {
    //             item.isWeapon = item.type === "weapon";
    //             item.isArmor = item.type === "armor";
    //             item.isGear = item.type === "gear";
    //             item.isRawMaterial = item.type === "rawMaterial";
    //             item.isBuilding = item.type === "building";
    //             item.isHireling = item.type === "hireling";
    //             if (item.type !== "building" && item.type !== "hireling") {
    //                 item.totalWeight = (CONFIG.fbl.encumbrance[item.system.weight] ?? item.system.weight ?? 1) * (item.system.quantity ?? 1);
    //             }
    //         }
    //     }

    //     activateListeners(html) {
    //         super.activateListeners(html);
    //         html.find("details").on("click", e => {
    //             let detail = $(e.target).closest("details"),
    //                 content = detail.find("summary ~ *");
    //             detail.attr("open") ? (e.preventDefault(), content.slideUp(200), setTimeout(() => { detail.removeAttr("open") }, 200)) : content.slideDown(200);
    //         });
    //     }

    //     _getHeaderButtons() {
    //         let buttons = super._getHeaderButtons();
    //         if (this.actor.isOwner) {
    //             buttons = [{
    //                 label: game.i18n.localize("SHEET.HEADER.REST"),
    //                 class: "rest-up",
    //                 icon: "fas fa-bed",
    //                 onclick: () => this._rest()
    //             }].concat(buttons);
    //         }
    //         return buttons;
    //     }

    //     async _rest() {
    //         let shelfLifeMapping = {
    //             "one day": 1,
    //             "day": 1,
    //             "one week": 7,
    //             "week": 7,
    //             "two weeks": 14,
    //             "one month": 30,
    //             "month": 30,
    //             "two months": 60,
    //             "one year": 365,
    //             "year": 365,
    //             "five years": 1825,
    //             "ten years": 3650
    //         };

    //         let itemsToDelete = [];
    //         let itemsLowShelfLife = [];
    //         let newItems = [];

    //         for (let item of this.actor.items) {
    //             let shelfLife = item.system.shelfLife;
    //             if (shelfLife) {
    //                 if (typeof shelfLife === "string") {
    //                     if (shelfLife === "-") {
    //                         // Create a new item if it is a Production item with "-" shelf life
    //                         if (item.name.startsWith("Production")) {
    //                             let newItemName = item.name.replace(/^Production\s*/, '');
    //                             let existingItem = this.actor.items.find(i => i.name === newItemName);
    //                             if (existingItem) {
    //                                 let existingQuantity = parseInt(existingItem.system.quantity);
    //                                 let productionQuantity = parseInt(item.system.quantity);
    //                                 if (!isNaN(existingQuantity) && !isNaN(productionQuantity)) {
    //                                     await existingItem.update({ "system.quantity": existingQuantity + productionQuantity });
    //                                 }
    //                             } else {
    //                                 let newItemData = duplicate(item);
    //                                 newItemData.name = newItemName;
    //                                 newItemData.system.quantity = parseInt(item.system.quantity);
    //                                 newItems.push(newItemData);
    //                             }
    //                         }
    //                     } else {
    //                         shelfLife = shelfLifeMapping[shelfLife.toLowerCase()] || parseInt(shelfLife);
    //                     }
    //                 }
    //                 if (!isNaN(shelfLife)) {
    //                     if (item.name.startsWith("Production")) {
    //                         // Create a new item with the same properties
    //                         let newItemData = duplicate(item);
    //                         newItemData.name = item.name.replace(/^Production\s*/, '');
    //                         newItems.push(newItemData);
    //                     } else {
    //                         let newShelfLife = shelfLife - 1;
    //                         let updatedName = item.name.replace(/\s*\(\d+\s*days?\)\s*$/, '');
    //                         updatedName += ` (${newShelfLife} day${newShelfLife !== 1 ? 's' : ''})`;
    //                         await item.update({ "system.shelfLife": newShelfLife, "name": updatedName });
    //                         if (newShelfLife <= 0) {
    //                             itemsToDelete.push(item);
    //                         } else {
    //                             if (newShelfLife < 5) {
    //                                 itemsLowShelfLife.push(updatedName);
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         // Create new items
    //         if (newItems.length > 0) {
    //             await this.actor.createEmbeddedDocuments("Item", newItems);
    //         }

    //         let deletionMessage = itemsToDelete.length > 0 ? `Deleted items due to shelf life expiration: ${itemsToDelete.map(item => item.name).join(", ")}.` : '';
    //         let lowShelfLifeMessage = itemsLowShelfLife.length > 0 ? `Items with less than 5 days of shelf life: ${itemsLowShelfLife.join(", ")}` : '';
    //         let newItemsMessage = newItems.length > 0 ? `New items created: ${newItems.map(item => item.name).join(", ")}` : '';

    //         let chatMessageContent = `
    //             <div class="forbidden-lands chat-item">
    //                 <h3>${this.actor.name} Rested</h3>
    //                 ${deletionMessage ? `<p>${deletionMessage}</p> </br></br>` : ''}
    //                 ${lowShelfLifeMessage ? `<p>${lowShelfLifeMessage}</p></br></br>` : ''}
    //                 ${newItemsMessage ? `<p>${newItemsMessage}</p></br>` : ''}
    //             </div>
    //         `;

    //         ChatMessage.create({
    //             content: chatMessageContent,
    //             speaker: { actor: this.actor }
    //         });

    //         if (itemsToDelete.length > 0) {
    //             await this.actor.deleteEmbeddedDocuments("Item", itemsToDelete.map(item => item.id));
    //         }
    //     }
    // };


    var ForbiddenLandsStrongholdSheet = class extends ForbiddenLandsActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["forbidden-lands", "sheet", "actor"],
            template: "systems/forbidden-lands/templates/actor/stronghold/stronghold-sheet.hbs",
            width: 650,
            height: 700,
            resizable: true,
            scrollY: [".buildings.item-list .items", ".hirelings.item-list .items", ".gears.item-listing .items"],
            tabs: [{
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "building"
            }]
        });
    }

    async getData() {
        let actorData = await super.getData();
        actorData.system.description = await TextEditor.enrichHTML(actorData.system.description, {
            async: true
        });
        this._computeItems(actorData);
        return actorData;
    }

    _computeItems(data) {
        for (let item of Object.values(data.items)) {
            item.isWeapon = item.type === "weapon";
            item.isArmor = item.type === "armor";
            item.isGear = item.type === "gear";
            item.isRawMaterial = item.type === "rawMaterial";
            item.isBuilding = item.type === "building";
            item.isHireling = item.type === "hireling";
            if (item.type !== "building" && item.type !== "hireling") {
                item.totalWeight = (CONFIG.fbl.encumbrance[item.system.weight] ?? item.system.weight ?? 1) * (item.system.quantity ?? 1);
            }
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        // Monitor changes in currency buttons
        html.find(".currency-button").on("click contextmenu", ev => {
            this.updateCurrency(ev);
        });

        // Monitor direct input changes in currency fields
        html.find("input[name^='system.currency']").on("change", ev => {
            this.updateCurrency(ev, true);
        });

        html.find("details").on("click", e => {
            let detail = $(e.target).closest("details"),
                content = detail.find("summary ~ *");
            detail.attr("open") ? (e.preventDefault(), content.slideUp(200), setTimeout(() => {
                detail.removeAttr("open")
            }, 200)) : content.slideDown(200);
        });
    }

    async updateCurrency(ev, isInput = false) {
        if (isInput) {
            // Wenn die Änderung aus Eingabefeldern kommt
            let fieldName = ev.target.name;
            let newValue = parseInt(ev.target.value);
            let oldValue = getProperty(this.actor.data, fieldName);
    
            await this.actor.update({
                [fieldName]: newValue
            });
    
            // Nachricht an den Chat senden
            let currencyType = fieldName.split('.')[2];
            let messageContent = `<span style="color: red;">${this.actor.name} hat die Währung geändert: ${currencyType.charAt(0).toUpperCase() + currencyType.slice(1)} von ${oldValue} auf ${newValue}</span>`;
            ChatMessage.create({
                content: messageContent,
                speaker: { actor: this.actor }
            });
        } else {
            // Wenn die Änderung durch Buttons kommt
            let currency = $(ev.currentTarget).data("currency");
            let operator = $(ev.currentTarget).data("operator");
            let modifier = ev.type === "contextmenu" ? 5 : 1;
            let coins = [this.actor.system.currency.gold.value, this.actor.system.currency.silver.value, this.actor.system.currency.copper.value];
            let i = { gold: 0, silver: 1, copper: 2 }[currency];
            if (operator === "plus") coins[i] += modifier;
            else {
                for (coins[i] -= modifier; i >= 0; --i) coins[i] < 0 && i > 0 && (coins[i - 1] -= 1, coins[i] += 10);
            }
            coins[0] >= 0 && await this.actor.update({
                "system.currency.gold.value": coins[0],
                "system.currency.silver.value": coins[1],
                "system.currency.copper.value": coins[2]
            });

            // Nachricht an den Chat senden
            let messageContent = `<span style="color: red;">${this.actor.name} hat ${modifier} ${currency} ${operator === "plus" ? "hinzugefügt" : "entfernt"}.</span>`;
            ChatMessage.create({
                content: messageContent,
                speaker: { actor: this.actor }
            });
        }
    }

   

    async _rest() {
            let shelfLifeMapping = {
                "-": 9999999,
                "one day": 1,
                "day": 1,
                "one week": 7,
                "week": 7,
                "two weeks": 14,
                "one month": 45,
                "month": 45,
                "two months": 90,
                "one year": 360,
                "year": 360,
                "five years": 1800,
                "ten years": 3600
            };

            let newItems = [];
            let hirelingCosts = {
                copper: 0,
                silver: 0,
                gold: 0
            };
            let canPayHirelings = true;

            let food = ["Meat", "Fish", "Bread", "Vegetables", "Egg", "Eggs"]

            let hasFoodItem = this.actor.items.some(item => food.includes(item.name));

            let daysAlive = this.actor.system.daysalive

            await this.actor.update({
                "system.daysalive": parseInt(this.actor.system.daysalive) + 1
            });

            let eventsAtTheStronghold = ''

            if ((daysAlive % 7) === 1) {
                eventsAtTheStronghold = ' <h3 style="color:red"> A long time has passed - maybe something happened...? Did you pay your Guards...? <br> Reputation: ' + this.actor.system.reputation + '</h3>'
            } else {
                eventsAtTheStronghold = '<h3 >' +  this.actor.name + ' made it through another day without any events, or did it...?</h3>'
            }

            

            let buildingRoll = false

            await this.object.update({
                "system.housing": 0
            });

            for (let item of this.actor.items) {
                if (item.type === 'building') {
                    /// production handling hinzufügen
                }
            }

            for (let item of this.actor.items) {
                if (item.type === "building") {
                    let buildingTime = item.system.time;
                    if (item.system.housing && item.name.includes("finished")) {
                        let housing = parseInt(item.system.housing);
                        await item.parent.update({
                            "system.housing": parseInt(item.parent.system.housing) + housing * item.system.quantity
                        });
                    }
        
                    if (typeof buildingTime !== 'number') {
                        buildingTime = shelfLifeMapping[buildingTime.toLowerCase()] || parseInt(buildingTime) || 0;
                    }
        
                    if (buildingTime > 0) {
                        await item.update({
                            "system.time": buildingTime - 1
                        });
                        await item.update({
                            "name": `${item.name.split(" (")[0]} (${buildingTime - 1} day(s) left until finish)`
                        });
                    } else {
                        await item.update({
                            "name": `${item.name.split(" (")[0]} (finished)`
                        });
                    }
        
                    if (buildingTime == 1) {
                        buildingRoll = true;
                    }
        
                    
                }
            }

            let housingMessageTrue =  false


            for (let item of this.actor.items) {
                let shelfLife = item.system.shelfLife;
                let productionQuantity = parseInt(item.system.quantity);

                if (item.type === 'hireling') {
                    if (item.system.salary.includes("Copper")) {
                        hirelingCosts.copper = hirelingCosts.copper + parseInt(item.system.salary) * parseInt(item.system.quantity);
                    }
                    if (item.system.salary.includes("Silver")) {
                        hirelingCosts.silver = hirelingCosts.silver + parseInt(item.system.salary) * parseInt(item.system.quantity);
                    }
                    if (item.system.salary.includes("Gold")) {
                        hirelingCosts.gold = hirelingCosts.gold + parseInt(item.system.salary) * parseInt(item.system.quantity);
                    }
                    if (item.system.salary.includes("Housing")) {
                        if (item.parent.system.housing > 0) {
                            await item.parent.update({
                                "system.housing": parseInt(item.parent.system.housing) - 1 * parseInt(item.system.quantity)
                            });
                        } 
                        if (item.parent.system.housing <= 0) {
                            housingMessageTrue = true
                        }
                        
                    }
                }

                if (item.name.startsWith("Production")) {
                    // Convert shelfLife to number using mapping if necessary
                    if (typeof(item.system.shelfLife) != "number") {
                        item.system.shelfLife = shelfLifeMapping[shelfLife.toLowerCase()] || parseInt(shelfLife);
                    }
                    

                    let newItemName = item.name.replace(/^Production\s*/, '');
                    let existingItem = this.actor.items.find(i => i.name === newItemName);

                    if (existingItem) {
                        let existingQuantity = parseInt(existingItem.system.quantity);
                        let maxQuantity = item.system.shelfLife * productionQuantity;


                        if (existingQuantity > maxQuantity) {
                            await existingItem.update({
                                "system.quantity": existingQuantity - productionQuantity
                            });
                        } else if (existingQuantity === maxQuantity) {

                        } else {
                            if (existingQuantity + productionQuantity > maxQuantity) {
                                await existingItem.update({
                                    "system.quantity": maxQuantity
                                });
                            } else {
                                await existingItem.update({
                                    "system.quantity": existingQuantity + productionQuantity
                                });
                            }
                        }


                    } else {
                        // Create new item if it doesn't exist
                        let newItemData = duplicate(item);
                        newItemData.system.shelfLife = shelfLifeMapping[shelfLife.toLowerCase()] || parseInt(shelfLife);
                        newItemData.name = newItemName;
                        newItemData.system.quantity = productionQuantity;
                        newItems.push(newItemData);
                    }
                }

                if (item.name.startsWith('Consume')) {
                    item.system.shelfLife = shelfLifeMapping[shelfLife.toLowerCase()] || parseInt(shelfLife);
                    let newItemName = item.name.replace(/^Consume\s*/, '');
                    let existingItem = this.actor.items.find(i => i.name === newItemName);

                    if (existingItem) {
                        let existingQuantity = parseInt(existingItem.system.quantity);
                        await existingItem.update({
                            "system.quantity": existingQuantity - productionQuantity
                        });

                        if (existingQuantity < 0) {
                            await this.actor.deleteEmbeddedDocuments("Item", [existingItem.id]);
                        }
                    }
                }
            }


            for (let item of this.actor.items) {
                if (item.name.startsWith("Copper Coin")) {
                    if (hirelingCosts.copper > 0) {

                        await item.update({
                            "system.quantity": item.system.quantity - hirelingCosts.copper
                        });

                        if (item.system.quantity < 0) {
                            await item.update({
                                "system.quantity": 0
                            });
                            canPayHirelings = false;
                        }
                    }
                }

                if (item.name.startsWith("Silver Coin")) {
                    if (hirelingCosts.silver > 0) {
                        await item.update({
                            "system.quantity": item.system.quantity - hirelingCosts.silver
                        });

                        if (item.system.quantity < 0) {
                            await item.update({
                                "system.quantity": 0
                            });
                            canPayHirelings = false;
                        }
                    }
                }

                if (item.name.startsWith("Gold Coin")) {
                    if (hirelingCosts.gold > 0) {
                        await item.update({
                            "system.quantity": item.system.quantity - hirelingCosts.gold
                        });

                        if (item.system.quantity < 0) {
                            await item.update({
                                "system.quantity": 0
                            });
                            canPayHirelings = false;
                        }
                    }
                }
            }



            // Create new items
            if (newItems.length > 0) {
                await this.actor.createEmbeddedDocuments("Item", newItems);
            }

            let newItemsMessage = newItems.length > 0 ? `New items created: ${newItems.map(item => item.name).join(", ")}` : '';
            let hirelingCostsMessage = ''
            let noFoodMessage = ''
            let buildingMessage = ''
            let housingMessage = ''
            
            if (hirelingCosts.gold > 0 || hirelingCosts.silver > 0 || hirelingCosts.copper > 0) {
                if (canPayHirelings) {
                    hirelingCostsMessage = 'The Hirelings were paid <br>' + hirelingCosts.gold + ' Gold Coins, <br>' + hirelingCosts.silver + ' Silver Coins and <br>' + hirelingCosts.copper + ' Copper Coins.'
                } else {
                    hirelingCostsMessage = "Couldn't pay all Hirelings."
                }
            }

            if (!hasFoodItem) {
                noFoodMessage = "No Food left in the Stronghold."
            }

            if (buildingRoll) {
                buildingMessage = "Building ready - please make Crafting Roll."
            }

            if (housingMessageTrue) {
                housingMessage = "Not enough Housing available."
            }



            let chatMessageContent = `
            <div class="forbidden-lands chat-item dice-roll">
                <img src="${this.actor.img}" alt="">
                ${eventsAtTheStronghold}
                ${buildingMessage ? `<p>${buildingMessage}</p>` : ''}
                ${newItemsMessage ? `<p>${newItemsMessage}</p>` : ''}
                ${housingMessage ? `<p>${housingMessage}</p>` : ''}
                ${noFoodMessage ? `<p>${noFoodMessage}</p>` : ''}
                ${hirelingCostsMessage ? `<p>${hirelingCostsMessage}</p>` : ''}
            </div>
        `;

            ChatMessage.create({
                content: chatMessageContent,
                speaker: {
                    actor: this.actor
                }
            });
        }
    };


    



    init_define_GLOBALPATHS();

    function experienceDialog() {
        let gamePlayers = game.users.players,
            characters = {},
            players = {},
            playersName = [];
        for (let player of gamePlayers) {
            let playerName = player.name,
                character = player.character;
            characters[playerName] = character, players[playerName] = player, playersName.push(playerName)
        }

        function createTemplate() {
            let form_html = `<form>
		<h2>${game.i18n.localize("EXPERIENCE.TITLE.PLAYERS")}</h2>
		<multi-checkbox name="players" class="players-choices">`;
            for (let player of gamePlayers) {
                let playerName = player.name,
                    selected = player.active ? "selected" : "";
                form_html += `<option value="${playerName}" ${selected}>${playerName}</option>`
            }
            form_html += "</multi-checkbox><br>", form_html += `<h2>${game.i18n.localize("EXPERIENCE.TITLE.ACTIONS")}</h2>
		<multi-checkbox name="actions" class="actions-choices">`;
            let actions = ["SESSION", "MAP", "SITE", "MONSTERS", "TREASURE", "FORTRESS", "PRIDE", "DARK_SECRET", "LIFE", "EXPLOIT"];
            for (let action of actions) {
                let actionLabel = game.i18n.localize(`EXPERIENCE.ACTIONS.${action}`);
                form_html += `<option value="${action}">${actionLabel}</option>`
            }
            return form_html += "</multi-checkbox></form><br>", form_html += `
		<style>
			multi-checkbox.actions-choices {
				grid-template-columns: repeat(2, 1fr);
			}

			multi-checkbox label.checkbox {
				align-items: center;
				display: flex;
				line-height: 16px;
				margin-bottom: 4px;
				word-break: break-word;
			}

			label.checkbox > input[type="checkbox"] {
				top: inherit;
			}
		</style>
		`, form_html
        }

        function assignExperience(html) {
            let xpGains = html.querySelectorAll("form .actions-choices input:checked").length,
                selectedPlayers = html.querySelectorAll("form .players-choices input:checked");
            for (let player of selectedPlayers) {
                let playerName = player.value,
                    playerCharacter = characters[playerName];
                if (!playerCharacter) return;
                let newXp = Number.parseInt(playerCharacter?.system?.bio?.experience?.value || 0) + xpGains;
                playerCharacter.update({
                    "system.bio.experience.value": newXp
                }), ChatMessage.create({
                    user: game.user.id,
                    speaker: ChatMessage.getSpeaker(),
                    content: game.i18n.format("EXPERIENCE.CHAT.MESSAGE", {
                        name: playerCharacter.name,
                        xpGains,
                        newXp
                    })
                }, {})
            }
        }
        new Dialog({
            title: game.i18n.localize("EXPERIENCE.TITLE.DIALOG"),
            content: createTemplate(),
            buttons: {
                ok: {
                    label: game.i18n.localize("EXPERIENCE.BUTTON.OK"),
                    icon: '<i class="fas fa-check"></i>',
                    callback: html => {
                        assignExperience(html[0])
                    }
                },
                cancel: {
                    label: game.i18n.localize("EXPERIENCE.BUTTON.CANCEL"),
                    icon: '<i class="fas fa-times"></i>',
                    callback: () => {}
                }
            },
            default: "cancel",
            close: () => {}
        }, {
            width: 600
        }).render(!0)
    }
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    var noop = () => {},
        CharacterPickerDialog = class _CharacterPickerDialog extends Dialog {
            static async show(title, characters, onSelect, onCancel) {
                onSelect = onSelect || noop, onCancel = onCancel || noop;
                let characterSelector = await this.buildCharacterSelector(characters);
                new _CharacterPickerDialog({
                    title,
                    content: this.buildDivHtmlDialog(characterSelector),
                    buttons: {
                        cancel: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Cancel",
                            callback: onCancel
                        }
                    },
                    select: onSelect,
                    default: "cancel",
                    close: onCancel
                }).render(!0)
            }
            activateListeners(html) {
                super.activateListeners(html), html.find(".party-member").click(this.handleCharacterSelect.bind(this))
            }
            handleCharacterSelect(event) {
                this.data.select($(event.currentTarget).data("entity-id")), this.close()
            }
            static async buildCharacterSelector(characters) {
                let html = "",
                    actor;
                for (let i = 0; i < characters.length; i++) actor = characters[i] instanceof Actor ? characters[i].data : game.actors.get(characters[i]).data, html += await renderTemplate("systems/forbidden-lands/templates/actor/party/components/member-component.hbs", {
                    partyMember: actor,
                    noCharSheetLink: !0
                });
                return `<ol>${html}</ol>`
            }
            static buildDivHtmlDialog(divContent) {
                return `<div class='flex row roll-dialog'>${divContent}</div>`
            }
        };
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    var InfoDialog = class {
        static show(title, message, onClose) {
            new Dialog({
                title,
                content: this.buildDivHtmlDialog(message),
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "OK",
                        callback: onClose
                    }
                },
                default: "ok",
                close: onClose
            }).render(!0)
        }
        static buildDivHtmlDialog(divContent) {
            return `<div class='flex row roll-dialog'>${divContent}</div>`
        }
    };
    var Helpers = class {
        static getCharacterDiceRoller(character) {
            if (character = character instanceof Actor ? character : game.user.character, !character) return;
            let charSheetClass = () => {};
            for (let chName in CONFIG.Actor.sheetClasses.character)
                if (chName === "forbidden-lands.ForbiddenLandsCharacterSheet") {
                    charSheetClass = CONFIG.Actor.sheetClasses.character[chName].cls;
                    break
                } let charSheet;
            for (let key in character.apps)
                if (character.apps[key] instanceof charSheetClass) {
                    charSheet = character.apps[key];
                    break
                } return charSheet ? charSheet.diceRoller : (InfoDialog.show(game.i18n.localize("FLPS.UI.ATTENTION"), game.i18n.localize("FLPS.UI.ERROR.OPEN_SHEET")), null)
        }
        static getOwnedCharacters(characterIds) {
            characterIds = typeof characterIds != "object" && characterIds !== "" ? [characterIds] : characterIds;
            let characters = [];
            for (let i = 0; i < characterIds.length; i++) game.actors.get(characterIds[i])?.isOwner && characters.push(game.actors.get(characterIds[i]));
            return characters
        }
    };

    function rollTravelAction(character, rollName) {
        !character && !character.owner || (rollName === "rest" ? character.rest() : character.sheet.rollAction(rollName))
    }

    const processedRollsGlobal = new Set(); // Globale Set, um alle verarbeiteten Würfe zu speichern

function handleTravelAction(assignedPartyMemberIds, rollName) {
    let assignedPartyMembers = Helpers.getOwnedCharacters(assignedPartyMemberIds);

    if (rollName === "travel-crafting") {
        if (assignedPartyMembers.length === 1) {
            openCraftingDialog(assignedPartyMembers[0]);
        } else if (assignedPartyMembers.length > 1) {
            CharacterPickerDialog.show(
                `${localizeString("FLPS.UI.WHO_CRAFTS")}`,
                assignedPartyMembers,
                entityId => {
                    let selectedActor = game.actors.get(entityId);
                    openCraftingDialog(selectedActor);
                }
            );
        }
    } else if (rollName === "travel-cook") {
        openTravelCookDialog(assignedPartyMembers);
    } else if (rollName === "travel-kill-prey") {
        if (assignedPartyMembers.length === 1) {
            openWeaponSelectionDialog(assignedPartyMembers[0]);
        } else if (assignedPartyMembers.length > 1) {
            CharacterPickerDialog.show(
                `${localizeString("FLPS.UI.WHO_ROLLS")} ${localizeString(rollName)}`,
                assignedPartyMembers,
                entityId => {
                    let selectedActor = game.actors.get(entityId);
                    openWeaponSelectionDialog(selectedActor);
                }
            );
        }
    } else {
        if (assignedPartyMembers.length === 1) {
            rollTravelAction(assignedPartyMembers[0], rollName);
        } else if (assignedPartyMembers.length > 1) {
            CharacterPickerDialog.show(
                `${localizeString("FLPS.UI.WHO_ROLLS")} ${localizeString(rollName)}`,
                assignedPartyMembers,
                entityId => {
                    rollTravelAction(game.actors.get(entityId), rollName);
                }
            );
        }
    }

    let hookId;

    hookId = Hooks.on('diceSoNiceRollComplete', (messageId) => {
        if (processedRollsGlobal.has(messageId)) return; // Verhindern mehrfacher Verarbeitung
        processedRollsGlobal.add(messageId);

        let lastRoll = game.messages.get(messageId);
        if (!lastRoll) return;

        let actor = game.actors.get(lastRoll.speaker.actor);
        if (!actor) return;

        const handleItemReward = (itemKey, quantity) => {
            let itemData = game.items.get(itemKey);
            if (!itemData) return;

            let existingItem = actor.items.find(i => i.name === itemData.name && i.system.shelfLife === itemData.system.shelfLife);

            if (existingItem) {
                existingItem.update({ 'data.quantity': existingItem.data.data.quantity + quantity });
            } else {
                let newItemData = itemData.toObject();
                newItemData.system.quantity = quantity;
                actor.createEmbeddedDocuments('Item', [newItemData]);
            }

            let chatMessage = `
                <div class="dice-roll">
                    <h4 class="dice-formula">
                        ${actor.name} receives
                    </h4>
                    <img class="profile-img" style="width: 150px" src="${itemData.img}" data-edit="img" title="" /> <br> 
                     <h4 class="dice-formula">
                     ${itemData.name}: ${quantity}
                    </h4>
                </div>`;

            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                content: chatMessage
            });
        };

        const processRollResult = (rollName, itemKey, sixMultiplier) => {
            if (lastRoll.rolls[0].options.name !== rollName) return;

            let sixCount = lastRoll.rolls[0].dice.reduce((count, die) => {
                return count + die.results.filter(result => result.result === 6).length;
            }, 0);

            if (sixCount > 0) {
                handleItemReward(itemKey, sixCount * sixMultiplier);
            }
        };

        const processForageResult = () => {
            if (lastRoll.rolls[0].options.name !== "Forage") return;
        
            let sixCount = lastRoll.rolls[0].dice.reduce((count, die) => {
                return count + die.results.filter(result => result.result === 6).length;
            }, 0);
        
            if (sixCount > 0) {
                new Dialog({
                    title: "Forage Result",
                    content: "<p>Choose your reward:</p>",
                    buttons: {
                        herbs: {
                            label: `<img class="forage-image" src="${getItemImage('SupoqycbuiyAHUL1')}" style=" vertical-align:middle; margin-right:5px;"> <br> Herbs`,
                            callback: () => handleItemReward('SupoqycbuiyAHUL1', sixCount)
                        },
                        vegetables: {
                            label: `<img class="forage-image" src="${getItemImage('s6hrxJwz2zsOGBrM')}" style=" vertical-align:middle; margin-right:5px;"> <br> Vegetables`,
                            callback: () => handleItemReward('s6hrxJwz2zsOGBrM', sixCount)
                        },
                        water: {
                            label: `<img class="forage-image" src="systems/forbidden-lands/assets/assorted/water.webp" style=" vertical-align:middle; margin-right:5px;"> <br> Water`,
                            callback: () => {
                                handleItemReward('water-key', sixCount);
        
                                // Holen des Ordners 'Spieler'
                                let playerFolder = game.folders.find(f => f.name === "Spieler" && f.type === "Actor");
        
                                if (playerFolder) {
                                    // Überprüfen aller Schauspieler im 'Spieler'-Ordner
                                    playerFolder.contents.forEach(actor => {
                                        if (actor.system.consumable && actor.system.consumable.water) {
                                            // Setze den Wasserwert auf 4, falls dieser vorhanden ist
                                            actor.update({ 'system.consumable.water.value': 4 });
                                        }
                                    });
                                } else {
                                    console.warn("Folder 'Spieler' not found!");
                                }
                            }
                        }
                    },
                    default: ""
                }, {
                    resizable: true,
                    classes: ["foraging-dialog"]
                }).render(true);
            }
        };
        
        
        
        // Funktion, die das Bild des Items basierend auf dem Key von game.items zurückgibt
        function getItemImage(itemKey) {
            const item = game.items.get(itemKey);
            if (item && item.img) {
                return item.img;
            } else {
                return 'path/to/default-icon.png'; // Standardbild, falls kein Bild vorhanden ist
            }
        }
        
        

        processRollResult("Chop Wood", 'zSA7X1QooILVS69A', 2);
        processRollResult("Fish", 'CXIhgFFaXOa61dtk', 1);
        processForageResult();

        Hooks.off('diceSoNiceRollComplete', hookId);
    });
}


    
function handleItemReward(actor, itemKey, quantity, prefix = "") {
    if (!actor._pendingRewards) {
        actor._pendingRewards = [];
    }

    let itemData = game.items.get(itemKey);
    if (!itemData) return;

    let timeSuffix = itemData.system.time ? ` (${itemData.system.time})` : "";
    let itemName = `${prefix ? `${prefix} ${itemData.name}` : itemData.name}${timeSuffix}`;

    let existingItem = null;
    if (prefix !== "Project") {
        existingItem = actor.items.find(i => i.name === itemName && i.data.data.shelfLife === itemData.data.data.shelfLife);
    }

    if (existingItem) {
        existingItem.update({ 'data.quantity': existingItem.data.data.quantity + quantity });
    } else {
        let newItemData = itemData.toObject();
        newItemData.name = itemName;
        newItemData.data.quantity = quantity;

        if (prefix === "Project") {
            newItemData.system.weight = "tiny";
        }

        actor.createEmbeddedDocuments('Item', [newItemData]);
    }

    actor._pendingRewards.push({ item: itemData, quantity, prefix });

    // Wenn das Präfix "Project" ist, sofortige Erstellung der Chatnachricht
    if (prefix === "Project") {
        let chatMessage = `<div class="dice-roll" style="text-align: center;">
                            <h4 class="dice-formula">${actor.name} starts project:</h4>`;

        chatMessage += `
            <div style="display: block">
                <div style="margin: 10px auto; text-align: center;">
                    <img class="" src="${itemData.img}" data-edit="img" title="" style="width: 100px; height: 100px; object-fit: contain;" />
                    <h4 class="dice-formula" style="margin-top: 10px;">${itemData.name}: ${quantity}</h4>
                </div>
            </div>`;

        chatMessage += `</div>`;

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: chatMessage
        });

        actor._pendingRewards = [];
    } else {
        // Für andere Belohnungen den Hook verwenden
        if (!actor._rewardHook) {
            actor._rewardHook = Hooks.on('diceSoNiceRollComplete', async (messageId) => {
                if (actor._pendingRewards && actor._pendingRewards.length > 0) {
                    let chatMessage = `<div class="dice-roll" style="text-align: center;">
                                        <h4 class="dice-formula">${actor.name} receives:</h4>`;
                    
                    for (let reward of actor._pendingRewards) {
                        chatMessage += `
                        <div style="display: block">
                            <div style="margin: 10px auto; text-align: center;">
                                <img class="" src="${reward.item.img}" data-edit="img" title="" style="width: 100px; height: 100px; object-fit: contain;" />
                                <h4 class="dice-formula" style="margin-top: 10px;">${reward.item.name}: ${reward.quantity}</h4>
                            </div>
                        </div>`;
                    }

                    chatMessage += `</div>`;

                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor: actor }),
                        content: chatMessage
                    });

                    actor._pendingRewards = [];
                    Hooks.off('diceSoNiceRollComplete', actor._rewardHook);
                    actor._rewardHook = null;
                }
            });
        }
    }
}


    
    
    function openCraftingDialog(actor) {
        let selectedItem = null;
    
        new Dialog({
            title: `Select Crafting Option for ${actor.name}`,
            content: ``,
            buttons: {
                new: {
                    label: "Start New Project",
                    callback: () => openNewProjectDialog(actor)
                },
                existing: {
                    label: "Continue Existing Project",
                    callback: () => openExistingProjectDialog(actor)
                },
                cancel: {
                    label: "Cancel",
                }
            },
            default: ""
        }, {
            // Options to customize the dialog's dimensions
            resizable: true, // prevent resizing
            classes: ["crafting-dialog"] // add a custom class for further customization if needed
        }).render(true);
    }
    
    
    function openNewProjectDialog(actor) {
        let selectedItem = null;
    
        new Dialog({
            title: `Select Crafting Item for ${actor.name}`,
            content: 
                `<div class="dialog-content" style="display: flex; flex-direction: column; height: 100%; margin: 0 auto;">
                    <div style="flex-grow: 1;">
                        <img class="profile-img" src="systems/forbidden-lands/assets/assorted/crafting.webp" data-edit="img" title="" />
                        <input type="text" class="item-search" id="item-search" placeholder="Search for items..." style="width: 100%;" />
                        <ul id="item-list" style="text-align:center; list-style: none; padding: 0; max-height: 400px; overflow-y: auto;">
                            ${game.items.contents
                                .slice(0, 3)
                                .map(item => `<li data-item-id="${item.id}">${item.name}</li>`)
                                .join('')}
                        </ul>
                        <div id="item-details" style="margin-top: 30px; background-color: lightgray; margin-bottom: 20px; text-align: center; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                            <img id="item-img" src="" style="display: none; max-width: 150px; margin-bottom: 10px;" />
                            <p><strong>Required Materials:</strong> <span id="materials">None</span></p>
                            <p><strong>Required Talents:</strong> <span id="talents">None</span></p>
                            <p><strong>Required Time:</strong> <span id="time">None</span></p>
                            <p><strong>Required Tools:</strong> <span id="tools">None</span></p>
                        </div>
                    </div>
                </div>`,
            buttons: {
                craft: {
                    label: "Craft",
                    callback: () => {
                        if (selectedItem) {
                            
                            handleItemReward(actor, selectedItem.id, 1, "Project");  
                        }
                    },
                    disabled: false
                },
                cancel: {
                    label: "Cancel",
                }
            },
            render: (html) => {
                const searchInput = html.find("#item-search");
                const itemList = html.find("#item-list");
                const details = {
                    img: html.find("#item-img"),
                    materials: html.find("#materials"),
                    talents: html.find("#talents"),
                    time: html.find("#time"),
                    tools: html.find("#tools")
                };
                const craftButton = html.find("button[name='craft']");
            
                details.img.attr("src", "modules/fbl-core-game/assets/game-icons/stake-hammer.svg").show();
            
                searchInput.on("input", () => {
                    const query = searchInput.val().toLowerCase();
                    itemList.empty();
            
                    const filteredItems = game.items.contents
                        .filter(item => item.name.toLowerCase().includes(query))
                        .slice(0, 3);
            
                    filteredItems.forEach(item => {
                        itemList.append(`<li data-item-id="${item.id}">${item.name}</li>`);
                    });
                });
            
                itemList.on("click", "li", (event) => {
                    itemList.find("li").css("background-color", "");  
                    const selectedItemElement = $(event.currentTarget);
                    selectedItemElement.css("background-color", "#d3d3d3");  
                    const itemId = selectedItemElement.data("item-id");
                    selectedItem = game.items.get(itemId);
                    
                    details.img.attr("src", selectedItem.img || "modules/fbl-core-game/assets/game-icons/stake-hammer.svg").show();
                    details.materials.text(selectedItem.system.rawMaterials || "None");
                    details.talents.text(selectedItem.system.talent || "None");
                    details.time.text(selectedItem.system.time || "None");
                    details.tools.text(selectedItem.system.tools || "None");
            
                    craftButton.prop("disabled", false);
                });
            
                html.find(".dialog-buttons button").css({
                    height: 'auto',
                    padding: '5px 10px',
                    fontSize: '14px',
                    lineHeight: 'normal',
                });
            
                html.closest(".dialog").find(".dialog-buttons").css({
                    marginTop: 'auto',
                });
            
                html.closest(".dialog").css({
                    height: 'auto',
                });
            
                setTimeout(() => {
                    const dialogHeight = html[0].scrollHeight + 50;
                    html.closest(".dialog").css('height', dialogHeight + 'px');
                }, 10);
            },
            
            default: ""
        }, {
            resizable: true, // prevent resizing
            classes: ["crafting-dialog-new"] // add a custom class for further customization if needed
        }).render(true);
    }
    
    function openExistingProjectDialog(actor) {
        const projectItems = actor.items.filter(item => item.name.startsWith("Project"));
    
        const shelfLifeMapping = {
            "quarter day": 1,
            "one day": 1,
            "day": 1,
            "two days": 2,
            "one week": 7,
            "week": 7,
            "two weeks": 14,
            "one month": 45,
            "month": 45,
            "two months": 90,
            "one year": 360,
            "year": 360,
            "five years": 1800,
            "ten years": 3600
        };
    
        const parseMaterials = (materialString) => {
            return materialString.split(',').map(item => {
                const [quantity, ...nameParts] = item.trim().split(' ');
                const materialName = nameParts.join(' ');
                let parsedQuantity = parseFloat(quantity);
    
                if (quantity.includes('/')) {
                    const [numerator, denominator] = quantity.split('/');
                    parsedQuantity = parseFloat(numerator) / parseFloat(denominator);
                }
    
                return { name: materialName, quantity: parsedQuantity };
            });
        };
    
        const hasSufficientMaterials = (requiredMaterials, actor) => {
            for (const required of requiredMaterials) {
                const actorMaterial = actor.items.find(i => i.name === required.name);
                if (!actorMaterial || actorMaterial.system.quantity < required.quantity) {
                    return false;
                }
            }
            return true;
        };
    
        const deductMaterials = async (requiredMaterials, actor) => {
            for (const required of requiredMaterials) {
                const actorMaterial = actor.items.find(i => i.name === required.name);
                if (actorMaterial) {
                    const newQuantity = actorMaterial.system.quantity - required.quantity;
                    if (newQuantity <= 0) {
                        await actorMaterial.delete();
                       
                    } else {
                        await actorMaterial.update({ "system.quantity": newQuantity });
                       
                    }
                }
            }
        };
    
        const dialog = new Dialog({
            title: `Select Existing Project for ${actor.name}`,
            content: 
                `<div class="dialog-content" style="display: flex; flex-direction: column; height: 100%; margin: 0 auto;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px">
                        ${projectItems.length > 0
                            ? projectItems.map(item => `
                                <button data-item-id="${item.id}" class="project-item" style="padding: 10px; text-align: center; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;">
                                   <img src="${item.img}"> <br> ${item.name}
                                </button>
                            `).join('')
                            : '<p>No existing projects found.</p>'}
                    </div>
                </div>`,
            buttons: {
                cancel: {
                    label: "Cancel",
                }
            },
            render: (html) => {
                const itemList = html.find(".project-item");
        
                itemList.on("click", async (event) => {
                    const selectedItemElement = $(event.currentTarget);
                    const itemId = selectedItemElement.data("item-id");
                    const selectedItem = actor.items.get(itemId);
        
                    if (selectedItem) {
                        const rawMaterialsString = selectedItem.system.rawMaterials;
                        const requiredMaterials = parseMaterials(rawMaterialsString);
        
                        if (hasSufficientMaterials(requiredMaterials, actor)) {
                            
        
                            let remainingTime = selectedItem.system.time;
                            if (typeof remainingTime === "string") {
                                remainingTime = shelfLifeMapping[remainingTime.toLowerCase()] || parseInt(remainingTime);
                            }
        
                            if (!isNaN(remainingTime)) {
                                const newTime = remainingTime - 1;
        
                                // Update item time and name
                                selectedItem.update({ "system.time": newTime });
        
                                const newName = selectedItem.name.replace(/\(.*?\)$/, "").trim();
                                selectedItem.update({ "name": `${newName} (${newTime} days)` });
        
                                if (selectedItem.system.weight !== "tiny") {
                                    selectedItem.update({ "system.weight": "tiny" });
                                }
        
                                if (newTime > 0) {
                                    ChatMessage.create({
                                        speaker: ChatMessage.getSpeaker({ actor: actor }),
                                        content: `<div class="dice-roll"><h4 class="dice-formula">${actor.name} worked on ${selectedItem.name.replace(/\s*\(.*?\)\s*/g, '')}:</h4>
                                                    <h4>Time remaining: ${newTime} days</h4></div>`
                                    });
                                }
                                
        
                                if (newTime <= 0) {
                                    new Dialog({
                                        title: `Crafting Roll for ${selectedItem.name}`,
                                        content: `<p>Roll to complete the crafting process. You need at least one 6 to successfully complete the project.</p>`,
                                        buttons: {
                                            roll: {
                                                label: "Roll",
                                                callback: async () => {
                                                    actor.sheet.rollAction("crafting");
        
                                                    const hookId = Hooks.on('diceSoNiceRollComplete', async (messageId) => {
                                                        let lastRoll = game.messages.get(messageId);
                                                        if (!lastRoll) return;
        
                                                        const sixCount = lastRoll.rolls[0].dice.reduce((acc, die) => {
                                                            return acc + die.results.filter(result => result.result === 6).length;
                                                        }, 0);
        
                                                        if (sixCount > 0) {
                                                            const finalName = selectedItem.name
                                                                .replace(/^Project\s/, '') 
                                                                .replace(/\s\(0 days\)$/, '');
        
                                                            const originalItem = game.items.find(i => i.name === finalName);
                                                            const originalWeight = originalItem ? originalItem.system.weight : selectedItem.system.weight;
        
                                                            await selectedItem.update({
                                                                'name': finalName,
                                                                'system.time': null,
                                                                'system.weight': originalWeight
                                                            });
        
                                                            await deductMaterials(requiredMaterials, actor);
        
                                                            ChatMessage.create({
                                                                speaker: ChatMessage.getSpeaker({ actor: actor }),
                                                                content: `<div class="dice-roll"><h4 class="dice-formula">${actor.name} crafted successfully:</h4>
                                                                            <div style="margin: 5px 0;">
                                                                                <br>
                                                                                <img class="" src="${selectedItem.img}" data-edit="img" title="" />
                                                                                
                                                                            </div>
                                                                          </div>`
                                                            });
        
                                                           
                                                        } else {
                                                            ChatMessage.create({
                                                                speaker: ChatMessage.getSpeaker({ actor: actor }),
                                                                content: `<div class="dice-roll"><h4 class="dice-formula">${actor.name} couldn't craft:</h4>
                                                                            <div style="margin: 5px 0;">
                                                                                <br>
                                                                                <img class="" src="${selectedItem.img}" data-edit="img" title="" />
                                                                              
                                                                            </div>
                                                                          </div>`
                                                            });
                                                            await selectedItem.delete();
                                                            await deductMaterials(requiredMaterials, actor);
                                                            
                                                        }
        
                                                        Hooks.off('diceSoNiceRollComplete', hookId);
                                                    });
                                                }
                                            },
                                            cancel: {
                                                label: "Cancel"
                                            }
                                        },
                                        default: "cancel"
                                    }).render(true);
                                }
                            }
                        } else {
                            ChatMessage.create({
                                speaker: ChatMessage.getSpeaker({ actor: actor }),
                                content: `<div class="dice-roll"><h4 class="dice-formula">${actor.name} lacks sufficient materials for ${selectedItem.name}:</h4>
                                            <div style="margin: 5px 0;">
                                                <h4>
                                                ${requiredMaterials.map(mat => `<p>${mat.quantity} x ${mat.name}</p>`).join('')}
                                                 </h4>
                                            </div>
                                          </div>`
                            });
                          
                        }
        
                        dialog.close();
                    }
                });
            },
        
            default: ""
        }, {
            resizable: true, // prevent resizing
            classes: ["crafting-dialog-existing"] // add a custom class for further customization if needed
        });
        
        dialog.render(true);
        
    }
    
    
    
    
    
    
        
    
    
    
    
    
        
    
    
    
    
    function openWeaponSelectionDialog(actor) {
        let lastMessages = game.messages.contents.slice(-5);
        let tableResultsMessage = null;
        let difficulty = 0;
    
        for (let message of lastMessages.reverse()) {
            let messageContent = $(message.data.content);
            if (messageContent.find('.table-results').length > 0) {
                tableResultsMessage = messageContent;
                break;
            }
        }
    
        if (tableResultsMessage) {
            let animal = null;
            let meat = 0;
            let pelts = 0;
    
            let animalElement = tableResultsMessage.find("p:contains('Animal')");
            let difficultyElement = tableResultsMessage.find("p:contains('Difficulty')");
            let meatElement = tableResultsMessage.find("p:contains('Meat')");
            let peltsElement = tableResultsMessage.find("p:contains('Pelts')");
    
            if (animalElement.length > 0) {
                animal = animalElement.text().replace(/^.*Animal:\s*/, '');
            }
            if (difficultyElement.length > 0) {
                difficulty = parseInt(difficultyElement.text().replace(/^\D+/g, ''));
            }
            if (meatElement.length > 0) {
                meat = parseInt(meatElement.text().replace(/^\D+/g, ''));
            }
            if (peltsElement.length > 0) {
                pelts = parseInt(peltsElement.text().replace(/^\D+/g, ''));
            }
    
            let meatItem = game.items.find(item => item.name.toLowerCase() === "meat");
            let peltItem = game.items.find(item => item.name.toLowerCase() === "pelt");
    
            let selectedWeapon = null;
    
            let weaponGrid = actor.items.filter(item => item.type === "weapon").map(weapon => {
                return `
                    <div class="weapon-option" data-weapon-id="${weapon.id}" style="border: 1px solid #ccc; padding: 10px; cursor: pointer; display: inline-block; margin: 5px;">
                        <img src="${weapon.img}" style="width: 50px; height: 50px;" />
                        <br>${weapon.name}
                    </div>
                `;
            }).join("");
    
            let content = `
                <div class="weapon-grid" style="display: flex; flex-wrap: wrap; justify-content: center;">
                    ${weaponGrid}
                </div>
                <div style="margin-top: 10px; text-align: center;">
                    <button id="confirm-selection" style="padding: 10px 20px;" disabled>Confirm</button>
                </div>
            `;
    
            let dialog = new Dialog({
                title: "Select Weapon",
                content: content,
                buttons: {},
                render: (html) => {
                    html.find(".weapon-option").click(function() {
                        html.find(".weapon-option").css("background-color", "");
                        $(this).css("background-color", "#a8dadc");
                        selectedWeapon = $(this).data("weapon-id");
                        html.find("#confirm-selection").prop("disabled", false);
                    });
    
                    html.find("#confirm-selection").click(() => {
                        if (selectedWeapon) {
                            actor.sheet.rollGear(selectedWeapon, { mod: difficulty }).then(roll => {
                                if (roll && roll.roll.dice) {
                                    let sixCount = roll.roll.dice.reduce((count, die) => {
                                        return count + die.results.filter(result => result.result === 6).length;
                                    }, 0);
    
                                    if (sixCount > 0) {
                                        if (meat > 0 && meatItem) {
                                            handleItemReward(actor, meatItem.id, meat);
                                        }
                                        if (pelts > 0 && peltItem) {
                                            handleItemReward(actor, peltItem.id, pelts);
                                        }
                                    }
                                } else {
                                    
                                }
                            });
                            dialog.close();
                        }
                    });
                }
            });
    
            dialog.render(true);
        } else {
           
        }
    }
    







// Variable zur Markierung, ob der Wurf ein Kochwurf war
let isCookingRoll = false;

// Funktion zum Öffnen des Cooking-Dialogs
function openTravelCookDialog(assignedPartyMembers) {
    // Check if there are multiple party members assigned
    if (assignedPartyMembers.length > 1) {
        // Show a character selection dialog
        CharacterPickerDialog.show(
            `${localizeString("FLPS.UI.WHO_ROLLS")}`,
            assignedPartyMembers,
            entityId => {
                const selectedMember = game.actors.get(entityId);
                openCookingDialogForMember(selectedMember);
            }
        );
    } else if (assignedPartyMembers.length === 1) {
        // Directly open the cooking dialog if there's only one party member
        openCookingDialogForMember(assignedPartyMembers[0]);
    } else {
        ui.notifications.warn("No party members are assigned for cooking.");
    }
}

function openCookingDialogForMember(member) {
    const dialog = new Dialog({
        title: "Cooking",
        content: `
        <div class="">
            <div class="header">
                <h2>Cooking</h2>
                <img class="profile-img" src="systems/forbidden-lands/assets/assorted/cooking.png" data-edit="img" title="" />
            </div>
            <div class="input-section">
                <h4 class="cooking-header" for="dice-formula">Enter Cooking Formula:</h4>
                <input type="text" placeholder="1d6" id="cookingformula" name="dice-formula" value="1d6" />
            </div>
        </div>
    `,
        buttons: {
            roll: {
                label: "Roll",
                callback: async (html) => {
                    const formula = html.find('input[name="dice-formula"]').val();
                    if (formula) {
                        isCookingRoll = true; // Mark this as a cooking roll
                        await rollDiceForCooking(member, formula);
                    }
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => {
                    
                }
            }
        },
        default: "",
    }, {
        // Options to customize the dialog's dimensions
        resizable: true, // prevent resizing
        classes: ["cooking-dialog"] // add a custom class for further customization if needed
    }).render(true);
}



// Funktion zum Würfeln für das Kochen
async function rollDiceForCooking(actor, diceFormula) {
    try {
        // Erstellen eines neuen Würfelwurfs mit der angegebenen Formel
        let roll = new Roll(diceFormula);
        await roll.evaluate({async: true});

        // Senden des Ergebnisses an den Chat
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: `${actor.name} rolls for Cooking`,
        });
    } catch (error) {
        console.error("Error rolling dice: ", error);
        ui.notifications.error("There was an error with the dice formula. Please check and try again.");
    }
}

// Hook, der ausgelöst wird, wenn ein Würfelwurf abgeschlossen ist
Hooks.on('diceSoNiceRollComplete', async (messageId) => {
    // Überprüfen, ob es sich um einen Kochwurf handelt
    if (isCookingRoll) {
        const message = game.messages.get(messageId);
        const rollResult = message.rolls[0].total; // Annahme: Es ist der erste Roll im Ergebnis

        // Trigger für die Zahlung nur, wenn es ein Kochwurf war
        isCookingRoll = false; // Markierung zurücksetzen
        handleCookingPayment(rollResult);
    }
});

// Funktion zur Bezahlung des Kochwurfs basierend auf dem Wurfergebnis
// Funktion zur Bezahlung des Kochwurfs basierend auf dem Wurfergebnis
// Funktion zur Bezahlung des Kochwurfs basierend auf dem Wurfergebnis
async function handleCookingPayment(rollResult) {
    let folderSpieler = game.folders.getName("Spieler");
    let folderStrongholds = game.folders.getName("Strongholds");
    let actorsInFolder = [...folderSpieler.contents, ...folderStrongholds.contents];

    let totalPaid = 0;
    let payments = {};

    let content = `
<div class="cooking-payment-dialog">
    <div class="header">
        <h2>Cooking Payment <br> (Max: ${rollResult})</h2>
    </div>`;

    for (let actor of actorsInFolder) {
        let hasRelevantItems = actor.items.contents.some(item =>
            ["meat", "egg", "vegetables", "fish"].includes(item.name.toLowerCase())
        );

        if (hasRelevantItems) {
            content += `
        <div class="actor-section" style="margin-bottom: 20px;">
            <h3>${actor.name}</h3>
            <div class="item-grid" style="display: flex; gap: 10px; flex-wrap: wrap;">`;

            for (let item of actor.items.contents) {
                if (["meat", "egg", "vegetables", "fish"].includes(item.name.toLowerCase())) {
                    const availableQuantity = item.system.quantity || 0;
                    const itemId = `item-${actor.id}-${item.id}`;
                    const maxQuantity = Math.min(availableQuantity, rollResult);

                    content += `
                <div class="item-tile" id="${itemId}" style="border: 1px solid #ccc; padding: 10px; text-align: center; cursor: pointer; flex: 1 0 100px; box-sizing: border-box;">
                    <span class="item-name">${item.name}</span><br>
                    <img class="profile-img" style="width: 50px; height: 50px;" src="${item.img}" data-edit="img" title="" />
                    <span style="font-size: 32px; font-weight: 800" class="item-quantity" id="quantity-${itemId}">0</span>/${maxQuantity}
                </div>`;
                }
            }

            content += `
            </div>
        </div>`;
        }
    }

    content += `
</div>`;

    let dialog = new Dialog({
        title: "Cooking Payment",
        content: content,
        buttons: {
            pay: {
                label: "Pay",
                callback: async (html) => {
                    let rationsCooked = Math.min(totalPaid, rollResult);

                    const speaker = ChatMessage.getSpeaker();
                    let paymentDetails = '';

                    for (let [actorId, items] of Object.entries(payments)) {
                        let actor = game.actors.get(actorId);
                        paymentDetails += `<strong>${actor.name}</strong> gave: `;
                        paymentDetails += Object.entries(items).map(([itemName, qty]) => `${qty}x ${itemName}`).join(", ");
                        paymentDetails += '<br>';

                        // Items von den Schauspielern abziehen
                        for (let [itemName, qty] of Object.entries(items)) {
                            let item = actor.items.contents.find(i => i.name === itemName);
                            if (item) {
                                let newQuantity = item.system.quantity - qty;
                                if (newQuantity <= 0) {
                                    await item.delete();  // Item löschen, wenn Menge 0 oder weniger ist
                                } else {
                                    await item.update({ "system.quantity": newQuantity });
                                }
                            }
                        }
                    }

                    const chatMessage = `<div class="dice-roll">
                                            <h4 class="dice-formula">
                                                ${speaker.alias} cooked ${rationsCooked} rations
                                            </h4>
                                            <img class="profile-img" src="systems/forbidden-lands/assets/assorted/food.webp" data-edit="img" title="" /> <br> 
                                            <h4 style="font-size: 14px" class="dice-formula">
                                            ${paymentDetails}
                                            </h4>
                                        </div>`;

                    ChatMessage.create({
                        speaker: speaker,
                        content: chatMessage
                    });

                    // Rationenverteilung starten
                    openRationDistributionDialog(rationsCooked, folderSpieler);
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => {
                    
                }
            }
        },
        default: "pay",
        render: html => {
            function increaseItemQuantity(actorId, itemId, itemName, maxQuantity) {
                const currentQuantity = parseInt(html.find(`#quantity-${itemId}`).text());

                if (currentQuantity < maxQuantity && totalPaid < rollResult) {
                    const newQuantity = currentQuantity + 1;
                    totalPaid += 1;

                    html.find(`#quantity-${itemId}`).text(newQuantity);

                    if (!payments[actorId]) {
                        payments[actorId] = {};
                    }
                    payments[actorId][itemName] = newQuantity;

                    if (newQuantity === maxQuantity || totalPaid === rollResult) {
                        html.find(`#${itemId}`).css('opacity', '0.5');
                    }
                }
            }

            function decreaseItemQuantity(actorId, itemId, itemName) {
                const currentQuantity = parseInt(html.find(`#quantity-${itemId}`).text());

                if (currentQuantity > 0) {
                    const newQuantity = currentQuantity - 1;
                    totalPaid -= 1;

                    html.find(`#quantity-${itemId}`).text(newQuantity);

                    if (payments[actorId]) {
                        payments[actorId][itemName] = newQuantity;

                        if (newQuantity === 0) {
                            delete payments[actorId][itemName];
                            if (Object.keys(payments[actorId]).length === 0) {
                                delete payments[actorId];
                            }
                        }
                    }

                    html.find(`#${itemId}`).css('opacity', '1.0');
                }
            }

            actorsInFolder.forEach(actor => {
                actor.items.contents.forEach(item => {
                    if (["meat", "egg", "vegetables", "fish"].includes(item.name.toLowerCase())) {
                        const itemId = `item-${actor.id}-${item.id}`;
                        const maxQuantity = Math.min(item.system.quantity || 0, rollResult);
                        const itemName = item.name;

                        html.find(`#${itemId}`).click(() => increaseItemQuantity(actor.id, itemId, itemName, maxQuantity));

                        html.find(`#${itemId}`).on('contextmenu', (event) => {
                            event.preventDefault();
                            decreaseItemQuantity(actor.id, itemId, itemName);
                        });
                    }
                });
            });
        }
    });

    dialog.render(true);
}



// Funktion zum Öffnen des Dialogs zur Rationenverteilung
function openRationDistributionDialog(rationsCooked, folderSpieler) {
    let remainingRations = rationsCooked;
    let rationsDistributed = {}; // Objekt zum Speichern der verteilten Rationen pro Schauspieler
    
    let content = `
    <div class="ration-distribution-dialog">
        <div class="header">
            <h2 style="text-align: center">Ration Distribution <br> Remaining Rations: <br> <span style="font-size: 52px" id="remaining-rations">${remainingRations}</span></h2>
        </div>
        <div class="actor-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">`;

    for (let actor of folderSpieler.contents) {
        // Prüfen, ob der Schauspieler das Attribut "consumable.food" hat und "system.bio.kin.value" kein leerer String ist
        if (actor.system.consumable?.food) {
            let currentValue = actor.system.consumable.food.value || 0;

            content += `
            <div class="actor-tile" id="actor-${actor.id}" style="margin-bottom: 10px; border: 1px solid #ccc; padding: 10px; text-align: center; cursor: pointer;">
                <img class="profile-img" src="${actor.img}" data-edit="img" title="" />
                <h3 style="margin-bottom: 10px;">${actor.name}</h3>
                <div>
                    <span class="rationcounter">Current Rations: <br> <span style="font-size: 32px" id="ration-count-${actor.id}">${currentValue}</span>/4</span>
                </div>
            </div>`;
        }
    }

    content += `
        </div>
    </div>`;

    let dialog = new Dialog({
        title: "Ration Distribution",
        content: content,
        buttons: {
            done: {
                label: "Done",
                callback: () => {
                    // Ausgabe der Chatnachricht am Ende der Rationsverteilung
                    let distributionDetails = '';
                    for (let [actorId, quantity] of Object.entries(rationsDistributed)) {
                        let actor = folderSpieler.contents.find(a => a.id === actorId);
                        distributionDetails += `<strong>${actor.name}</strong> received: ${quantity} ration(s)<br>`;
                    }

                    const speaker = ChatMessage.getSpeaker();
                    const chatMessage = `<div class="dice-roll">
                                            <h4 style="font-size: 28px" class="dice-formula">
                                                ${speaker.alias} distributed rations
                                            </h4>
                                            <h4 style="font-size: 14px" class="dice-formula">
                                            ${distributionDetails}
                                            </h4>
                                        </div>`;

                    ChatMessage.create({
                        speaker: speaker,
                        content: chatMessage
                    });

                    
                }
            }
        },
        default: "done",
        render: html => {
            // Funktion zum Verteilen einer Ration an den ausgewählten Schauspieler
            function distributeRation(actorId) {
                if (remainingRations > 0) {
                    let actor = folderSpieler.contents.find(a => a.id === actorId);
                    let currentRations = actor.system.consumable.food.value || 0;

                    if (currentRations < 4) {
                        let newRations = currentRations + 1;
                        remainingRations--;

                        actor.update({ 'system.consumable.food.value': newRations });

                        html.find(`#ration-count-${actorId}`).text(newRations);
                        html.find("#remaining-rations").text(remainingRations);

                        // Verteilte Rationen für diesen Schauspieler verfolgen
                        if (!rationsDistributed[actorId]) {
                            rationsDistributed[actorId] = 0;
                        }
                        rationsDistributed[actorId] += 1;

                        if (remainingRations <= 0) {
                            html.find('.actor-tile').css('pointer-events', 'none');
                        }
                    }
                }
            }

            // Event-Listener für jede Schauspieler-Kachel hinzufügen
            folderSpieler.contents.forEach(actor => {
                html.find(`#actor-${actor.id}`).click(() => distributeRation(actor.id));
            });
        }
    });

    dialog.render(true);
}

    
    
    
    
    
    
    
    
    
    
    var TravelActionsConfig = {
        hike: {
            key: "hike",
            journalEntryName: "Hike",
            name: "FLPS.TRAVEL.HIKE",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.FORCED_MARCH",
                class: "travel-forced-march",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.hike, "travel-forced-march")
                }
            }, {
                name: "FLPS.TRAVEL_ROLL.HIKE_IN_DARKNESS",
                class: "travel-hike-in-darkness",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.hike, "travel-hike-in-darkness")
                }
            }]
        },
        lead: {
            key: "lead",
            journalEntryName: "Lead the Way",
            name: "FLPS.TRAVEL.LEAD",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.NAVIGATE",
                class: "travel-navigate",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.lead, "travel-navigate")
                }
            }, {
                name: "FLPS.TRAVEL_ROLL.SEA_TRAVEL",
                class: "travel-sea-travel",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.lead, "travel-sea-travel")
                }
            }]
        },
        watch: {
            key: "watch",
            journalEntryName: "Keep Watch",
            name: "FLPS.TRAVEL.WATCH",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.KEEP_WATCH",
                class: "travel-keep-watch",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.watch, "travel-keep-watch")
                }
            }]
        },
        camp: {
            key: "camp",
            journalEntryName: "Make Camp",
            name: "FLPS.TRAVEL.CAMP",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.MAKE_CAMP",
                class: "travel-make-camp",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.camp, "travel-make-camp")
                }
            }]
        },
        rest: {
            key: "rest",
            journalEntryName: "Rest",
            name: "FLPS.TRAVEL.REST",
            buttons: [{
                name: "FLPS.TRAVEL.REST",
                class: "travel-rest",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.rest, "rest")
                }
            }]
        },
        sleep: {
            key: "sleep",
            journalEntryName: "Sleep",
            name: "FLPS.TRAVEL.SLEEP",
            buttons: [{
                name: "FLPS.TRAVEL.REST",
                class: "travel-sleep",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.sleep, "rest")
                }
            }, {
                name: "FLPS.TRAVEL_ROLL.FIND_GOOD_PLACE",
                class: "travel-find-good-place",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.sleep, "travel-find-good-place")
                }
            }]
        },
        other: {
            key: "other",
            journalEntryName: "",
            name: "FLPS.TRAVEL.OTHER",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.SURVEY",
                class: "travel-survey",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.other, "travel-survey")
                }
            },
            {
                name: "FLPS.TRAVEL_ROLL.WOOD",
                class: "travel-wood",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.other, "travel-wood")
                }
            },
            {
                name: "FLPS.TRAVEL_ROLL.COOK",
                class: "travel-cook",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.other, "travel-cook")
                }
            },
            {
                name: "FLPS.TRAVEL_ROLL.CRAFTING",
                class: "travel-crafting",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.other, "travel-crafting")
                }
            }]
        },
        forage: {
            key: "forage",
            journalEntryName: "Forage",
            name: "FLPS.TRAVEL.FORAGE",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.FIND_FOOD",
                class: "travel-find-food",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.forage, "travel-find-food")
                }
            }]
        },
        hunt: {
            key: "hunt",
            journalEntryName: "Hunt",
            name: "FLPS.TRAVEL.HUNT",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.FIND_PREY",
                class: "travel-find-prey",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.hunt, "travel-find-prey")
                }
            }, {
                name: "FLPS.TRAVEL_ROLL.KILL_PREY",
                class: "travel-kill-prey",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.hunt, "travel-kill-prey")
                }
            }]
        },
        fish: {
            key: "fish",
            journalEntryName: "Fish",
            name: "FLPS.TRAVEL.FISH",
            buttons: [{
                name: "FLPS.TRAVEL_ROLL.CATCH_FISH",
                class: "travel-catch-fish",
                handler: party => {
                    handleTravelAction(party.actorProperties.travel.fish, "travel-catch-fish")
                }
            }]
        }
    };

    
    var ForbiddenLandsPartySheet = class extends ActorSheet {
        static get defaultOptions() {
            let dragDrop = [...super.defaultOptions.dragDrop];
            return dragDrop.push({
                dragSelector: ".party-member",
                dropSelector: ".party-member-list"
            }), mergeObject(super.defaultOptions, {
                classes: ["forbidden-lands", "sheet", "actor", "party"],
                template: "systems/forbidden-lands/templates/actor/party/party-sheet.hbs",
                width: window.innerWidth * .05 + 650,
                resizable: !0,
                tabs: [{
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main"
                }],
                dragDrop
            })
        }
        get actorProperties() {
            return this.actor.system
        }
        async getData() {
            let {
                data
            } = await super.getData();
            data.partyMembers = {}, data.travelActions = this.getTravelActions(), data.encounterTables = await this.getEncounterTables(), data.isGm = game.user.isGM;
            let ownedActorId;
            for (let i = 0; i < (data.system.members || []).length; i++) ownedActorId = data.system.members[i], data.partyMembers[ownedActorId] = game.actors.get(ownedActorId);
            return data.system.description = await TextEditor.enrichHTML(data.system.description, {
                async: !0
            }), data
        }
        activateListeners(html) {
            super.activateListeners(html), html.find(".item-delete").click(this.handleRemoveMember.bind(this)), html.find(".reset").click(event => {
                event.preventDefault(), this.resetTravelActions(), this.render(!0)
            }), html.find(".encounter-table").click(async event => {
                event.preventDefault();
                let target = event.currentTarget;
                await game.tables.get(target.dataset.id).draw()
            }), html.find(".configure-tables").click(async event => {
                event.preventDefault(), await new TableConfigMenu().render(!0), this.render(!0)
            }), html.find(".party-experience").click(async event => (event.preventDefault(), experienceDialog()));
            let button;
            for (let key in TravelActionsConfig)
                for (let i = 0; i < TravelActionsConfig[key].buttons.length; i++) button = TravelActionsConfig[key].buttons[i], html.find(`.${button.class}`).click(button.handler.bind(this, this))
        }
        getTravelActions() {
            let travelActions = TravelActionsConfig;
            for (let action of Object.values(travelActions)) action.displayJournalEntry = !!action.journalEntryName && !!game.journal.getName(action.journalEntryName), action.participants = this.document.system.travel[action.key].map(id => game.actors.get(id));
            return travelActions
        }
        async getEncounterTables() {
            let tableSettings = game.settings.get("forbidden-lands", "encounterTables");
            return Object.fromEntries(Object.entries(tableSettings).filter(t => !!t[1]).map(t => [localizeString(t[0]), t[1]]))
        }
        async handleRemoveMember(event) {
            event.preventDefault();
            let div = $(event.currentTarget).parents(".party-member"),
                entityId = div.data("entity-id"),
                partyMembers = this.actorProperties.members;
            partyMembers.splice(partyMembers.indexOf(entityId), 1);
            let updateData = {
                    "system.members": partyMembers
                },
                travelAction, actionParticipants;
            for (let travelActionKey in this.actorProperties.travel) travelAction = this.actorProperties.travel[travelActionKey], !(travelAction.indexOf(entityId) < 0) && (typeof travelAction == "object" ? (actionParticipants = [...travelAction], actionParticipants.splice(actionParticipants.indexOf(entityId), 1), updateData[`system.travel.${travelActionKey}`] = actionParticipants) : updateData[`system.travel.${travelActionKey}`] = "");
            await this.actor.update(updateData), div.slideUp(200, () => this.render(!1))
        }
        _onDragStart(event) {
            if (event.currentTarget.dataset.itemId !== void 0) {
                super._onDragStart(event);
                return
            }
            let entityId = event.currentTarget.dataset.entityId;
            event.dataTransfer.setData("text/plain", JSON.stringify({
                type: "Actor",
                action: "assign",
                uuid: `Actor.${entityId}`
            }))
        }
        async _onDrop(event) {
            super._onDrop(event);
            let draggedItem = JSON.parse(event.dataTransfer.getData("text/plain"));
            if (!draggedItem || draggedItem.type !== "Actor") return;
            let actorId = draggedItem.uuid.split(".")[1],
                actor = game.actors.get(actorId);
            if (actor?.type === "character") return draggedItem.action === "assign" ? await this.handleTravelActionAssignment(event, actor) : await this.handleAddToParty(actor), this.render(!0)
        }
        async handleTravelActionAssignment(event, actor) {
            let targetElement = event.toElement ? event.toElement : event.target,
                actionContainer = targetElement.classList.contains("travel-action") ? targetElement : targetElement.closest(".travel-action");
            if (actionContainer !== null) return this.assignPartyMemberToAction(actor, actionContainer.dataset.travelAction)
        }
        async assignPartyMemberToAction(partyMember, travelActionKey) {
            let travelAction = this.actorProperties.travel[travelActionKey];
            if (travelAction.includes(partyMember.id)) return;
            let currentAction = Object.entries(this.actorProperties.travel).find(([_2, array]) => array.includes(partyMember.id)),
                updateData = {
                    [`system.travel.${travelActionKey}`]: [...travelAction, partyMember.id],
                    [`system.travel.${currentAction[0]}`]: currentAction[1].filter(id => id !== partyMember.id)
                };
            return this.actor.update(updateData)
        }
        async handleAddToParty(actor) {
            let partyMembers = this.actorProperties.members,
                initialCount = partyMembers.length;
            if (partyMembers = [...new Set([...partyMembers, actor.id])], initialCount === partyMembers.length) return;
            let travelOther = [...this.actorProperties.travel.other, actor.id];
            return this.actor.update({
                "system.members": partyMembers,
                "system.travel.other": travelOther
            })
        }
        async resetTravelActions() {
            let updates = Object.keys(this.actorProperties.travel).reduce((acc, key) => (key === "other" ? acc[`system.travel.${key}`] = this.actorProperties.members : acc[`system.travel.${key}`] = [], acc), {});
            return this.actor.update(updates)
        }
    };
    init_define_GLOBALPATHS();
    init_define_GLOBALPATHS();
    var ForbiddenLandsItemSheet = class _ForbiddenLandsItemSheet extends ItemSheet {
        get itemData() {
            return this.item.data
        }
        get itemProperties() {
            return this.item.system
        }
        get config() {
            return CONFIG.fbl
        }
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                classes: ["forbidden-lands", "sheet", "item"],
                width: window.innerWidth * .08 + 350,
                resizable: !1
            })
        }
        static async enrichContent(content, isOwner) {
            return TextEditor.enrichHTML(content, {
                async: !0,
                secrets: isOwner
            })
        }
        _getHeaderButtons() {
            let buttons = super._getHeaderButtons();
            return buttons = [{
                label: game.i18n.localize("SHEET.HEADER.POST_ITEM"),
                class: "item-post",
                icon: "fas fa-comment",
                onclick: () => {
                    this.item.sendToChat()
                }
            }].concat(buttons), buttons
        }
        #computeQuality(data) {
            return data.artifact = !!data.system.artifactBonus, data.lethal = data.system.lethal === "yes", data.ranks = data.system.type === "general" || data.system.type === "profession", data
        }
        async #enrichTextEditorFields(data) {
            let fields = CONFIG.fbl.enrichedItemFields;
            for (let field of fields) {
                let [key, subKey] = field.split(".");
                subKey && data.system[key]?.[subKey] ? data.system[key][subKey] = await _ForbiddenLandsItemSheet.enrichContent(data.system[key][subKey], game.user.isGM) : data.system[key] && (data.system[field] = await _ForbiddenLandsItemSheet.enrichContent(data.system[field], game.user.isGM))
            }
            return data
        }
        async getData() {
            let data = super.getData().data;
            return data.flags = this.item.flags["forbidden-lands"], data.encumbranceValues = this.config.encumbrance, data.isGM = game.user.isGM, data = this.#computeQuality(data), data = await this.#enrichTextEditorFields(data), data
        }
        _onChangeTab(event, tabs, active) {
            return $(`#${this.id} textarea`).each(function() {
                this.value && (this.readOnly = !0, this.setAttribute("style", `height:${this.scrollHeight}px;overflow-y:hidden;`))
            }), super._onChangeTab(event, tabs, active)
        }
        activateListeners(html) {
            super.activateListeners(html), html.find(".add-modifier").click(async ev => {
                ev.preventDefault();
                let rollModifiers = (await this.getData()).system.rollModifiers || {},
                    modifierId = Math.max(-1, ...Object.getOwnPropertyNames(rollModifiers)) + 1,
                    update = {};
                update[`system.rollModifiers.${modifierId}`] = {
                    name: "ATTRIBUTE.STRENGTH",
                    value: "+1"
                }, await this.item.update(update)
            }), html.find(".delete-modifier").click(async ev => {
                ev.preventDefault();
                let data = await this.getData(),
                    rollModifiers = duplicate(data.system.rollModifiers || {}),
                    modifierId = $(ev.currentTarget).data("modifier-id");
                delete rollModifiers[modifierId];
                for (let key in Object.keys(rollModifiers)) rollModifiers[key] || delete rollModifiers[key];
                await this.item.update({
                    "system.rollModifiers": null
                }), Object.keys(rollModifiers).length > 0 && await this.item.update({
                    "system.rollModifiers": rollModifiers
                })
            }), html.find(".change-bonus").on("click contextmenu", ev => {
                let bonus = this.itemProperties.bonus,
                    value = bonus.value,
                    altInteraction = game.settings.get("forbidden-lands", "alternativeSkulls");
                ev.type === "click" && !altInteraction || ev.type === "contextmenu" && altInteraction ? value = Math.max(value - 1, 0) : (ev.type === "contextmenu" && !altInteraction || ev.type === "click" && altInteraction) && (value = Math.min(value + 1, bonus.max)), this.object.update({
                    "system.bonus.value": value
                })
            }), html.find(".feature").click(async ev => {
                let featureName = $(ev.currentTarget).data("feature"),
                    features = this.object.itemProperties.features;
                CONFIG.fbl.weaponFeatures.includes(featureName) && this.object.update({
                    [`system.features.${featureName}`]: !features[featureName]
                }), this._render()
            }), html.find(".hide-field").click(ev => {
                let fieldName = $(ev.currentTarget).data("fieldname"),
                    currentValue = this.object.getFlag("forbidden-lands", fieldName);
                this.object.setFlag("forbidden-lands", fieldName, !currentValue)
            })
        }
        async getCustomRollModifiers() {
            let pack = game.packs.get("world.customrollmodifiers");
            return pack ? (await pack.getContent()).map(item => item.name) : []
        }
        async _renderInner(data, options) {
            let showField = field => {
                let enabledInSettings = game.settings.get("forbidden-lands", `show${field}Field`),
                    isVisibleToPlayer = game.user.isGM || !this.object.getFlag("forbidden-lands", field);
                return enabledInSettings && isVisibleToPlayer
            };
            return data = {
                ...data,
                alternativeSkulls: game.settings.get("forbidden-lands", "alternativeSkulls"),
                showCraftingFields: game.settings.get("forbidden-lands", "showCraftingFields"),
                showCostField: game.settings.get("forbidden-lands", "showCostField"),
                showSupplyField: game.settings.get("forbidden-lands", "showSupplyField"),
                showEffectField: showField("Effect"),
                showDescriptionField: showField("Description"),
                showDrawbackField: showField("Drawback"),
                showAppearanceField: showField("Appearance")
            }, data.system.customRollModifiers = await this.getCustomRollModifiers(), super._renderInner(data, options)
        }
    };
    var ForbiddenLandsWeaponSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/weapon/weapon-sheet.hbs",
                tabs: [{
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main"
                }]
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsArmorSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/armor/armor-sheet.hbs",
                tabs: [{
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main"
                }]
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsGearSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/gear/gear-sheet.hbs",
                tabs: [{
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main"
                }]
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsRawMaterialSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/raw-material/raw-material-sheet.hbs"
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsSpellSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/spell/spell-sheet.hbs"
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsTalentSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/talent/talent-sheet.hbs"
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsCriticalInjurySheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/critical-injury/critical-injury-sheet.hbs",
                width: 400,
                height: 310
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsMonsterAttackSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/monster-attack/monster-attack-sheet.hbs"
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsBuildingSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/building/building-sheet.hbs"
            })
        }
    };
    init_define_GLOBALPATHS();
    var ForbiddenLandsHirelingSheet = class extends ForbiddenLandsItemSheet {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                ...super.defaultOptions,
                template: "systems/forbidden-lands/templates/item/hireling/hireling-sheet.hbs"
            })
        }
    };
    init_define_GLOBALPATHS();
    var AdventureSitesSheet = class extends JournalSheet {
        get template() {
            return "systems/forbidden-lands/templates/journal/adventure-sites/adventure-site-sheet.hbs"
        }
        getData(options) {
            let data = super.getData(options);
            return data.type = this.object.type, data
        }
        activateListeners(html) {
            super.activateListeners(html), html.find('[data-action="add-room"]').on("click", async () => {
                let type = this.object.type,
                    path = CONFIG.fbl.adventureSites.types[type],
                    room = await CONFIG.fbl.adventureSites?.generate(path, `${type}_rooms`),
                    pageName = $(room).find("h4, strong")?.first().text().replace(/[^\p{L}]+/u, " ").trim();
                await this.object.createEmbeddedDocuments("JournalEntryPage", [{
                    name: pageName,
                    title: {
                        level: 2,
                        show: !1
                    },
                    text: {
                        content: room
                    }
                }])
            })
        }
    };

    function registerSheets() {
        Actors.unregisterSheet("core", ActorSheet), Actors.registerSheet("forbidden-lands", ForbiddenLandsCharacterSheet, {
            types: ["character"],
            makeDefault: !0
        }), Actors.registerSheet("forbidden-lands", ForbiddenLandsMonsterSheet, {
            types: ["monster"],
            makeDefault: !0
        }), Actors.registerSheet("forbidden-lands", ForbiddenLandsStrongholdSheet, {
            types: ["stronghold"],
            makeDefault: !0
        }), Actors.registerSheet("forbidden-lands", ForbiddenLandsPartySheet, {
            types: ["party"],
            makeDefault: !0
        }), Items.unregisterSheet("core", ItemSheet), Items.registerSheet("forbidden-lands", ForbiddenLandsWeaponSheet, {
            types: ["weapon"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsArmorSheet, {
            types: ["armor"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsGearSheet, {
            types: ["gear"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsRawMaterialSheet, {
            types: ["rawMaterial"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsSpellSheet, {
            types: ["spell"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsTalentSheet, {
            types: ["talent"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsCriticalInjurySheet, {
            types: ["criticalInjury"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsMonsterAttackSheet, {
            types: ["monsterAttack"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsBuildingSheet, {
            types: ["building"],
            makeDefault: !0
        }), Items.registerSheet("forbidden-lands", ForbiddenLandsHirelingSheet, {
            types: ["hireling"],
            makeDefault: !0
        }), CONFIG.fbl.adventureSites.sheetClass = AdventureSitesSheet
    }
    init_define_GLOBALPATHS();
    var ForbiddenLandsTokenHUD = class extends TokenHUD {
        _getStatusEffectChoices() {
            let actor = this.object.document.actor,
                data = super._getStatusEffectChoices();
            if (actor?.type === "character") return data;
            for (let [key, effect] of Object.entries(data)) effect && CONFIG.fbl.conditions.includes(effect?.id) && delete data[key];
            return data
        }
    };
    Hooks.once("init", () => {
        FoundryOverrides(), registerSettings(), registerHooks(), game.fbl = {
            config: config_default,
            roll: FBLRollHandler.createRoll
        }, CONFIG.Actor.documentClass = ForbiddenLandsActor, CONFIG.Item.documentClass = ForbiddenLandsItem, CONFIG.JournalEntry.documentClass = ForbiddenLandsJournalEntry, CONFIG.statusEffects = [...CONFIG.statusEffects.filter(effect => !["sleep", "frozen", "curse"].includes(effect.id)), ...config_default.statusEffects], CONFIG.fbl = config_default, CONFIG.fbl.adventureSites.utilities = utilities, CONFIG.fbl.adventureSites.generate = (path, adventureSite) => init(path, adventureSite), YearZeroRollManager.register("fbl", {
            "ROLL.chatTemplate": "systems/forbidden-lands/templates/components/roll-engine/roll.hbs",
            "ROLL.tooltipTemplate": "systems/forbidden-lands/templates/components/roll-engine/tooltip.hbs",
            "ROLL.infosTemplate": "systems/forbidden-lands/templates/components/roll-engine/infos.hbs"
        }), CONFIG.Dice.terms[6] = ForbiddenLandsD6, registerYZURLabels(), registerSheets(), initializeHandlebars(), initializeEditorEnrichers(), registerFonts(), modifyConfig(), game.settings.get("forbidden-lands", "darkmode") && $("html").addClass("dark"), game.settings.get("forbidden-lands", "removeBorders") && $("html").addClass("no-borders")
    });
    Hooks.once("ready", () => {
        migrateWorld(), displayMessages(), importMacros(), game.settings.get("forbidden-lands", "autoDecreaseConsumable") === 0 && Hooks.on("getChatLogEntryContext", (_html, options) => {
            let isConsumableRoll = li => !!li.find(".consumable-result").length;
            options.push({
                name: localizeString("CONTEXT.REDUCE_CONSUMABLE"),
                icon: "<i class='fas fa-arrow-down'></i>",
                condition: isConsumableRoll,
                callback: li => FBLRollHandler.decreaseConsumable(li.attr("data-message-id") || "")
            })
        })
    });



    Hooks.on('renderActorSheet', (app, html, data) => {
        let actor = app.actor;
        let user = game.user;  // Aktueller Benutzer
    
        // Stelle sicher, dass der Button nur einmal hinzugefügt wird
        if (!html.closest('.window-app').find('.manage-pin').length) {
            // Button für PIN-Verwaltung hinzufügen
            const managePinButton = `<a class="header-button control manage-pin" title="PIN verwalten"><i class="fas fa-lock"></i> PIN verwalten</a>`;
            html.closest('.window-app').find('.window-title').after(managePinButton);
        }
    
        // Entferne alle bestehenden click-Handler, bevor ein neuer hinzugefügt wird
        html.closest('.window-app').find('.manage-pin').off('click').click(async (ev) => {
            ev.preventDefault();
    
            // Dialog zur PIN-Verwaltung
            new Dialog({
                title: "PIN verwalten",
                content: `
                    <p>Was möchtest du mit dem PIN-Code tun?</p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button id="set-pin">PIN setzen</button>
                        <button id="change-pin" ${!actor.getFlag('world', 'pinCode') ? 'disabled' : ''}>PIN ändern</button>
                        <button id="remove-pin" ${!actor.getFlag('world', 'pinCode') ? 'disabled' : ''} style="color: red;">PIN entfernen</button>
                    </div>
                `,
                buttons: {
                    close: {
                        label: "Schließen",
                        callback: () => {}
                    }
                },
                render: (html) => {
                    html.find('#set-pin').click(async () => {
                        let setPinDialog = new Dialog({
                            title: "PIN setzen",
                            content: `<p>Bitte gib einen neuen PIN-Code ein:</p>
                                      <input type="password" id="new-pin-input" placeholder="PIN-Code eingeben" autocomplete="off">`,
                            buttons: {
                                submit: {
                                    icon: "<i class='fas fa-check'></i>",
                                    label: "Setzen",
                                    callback: async (html) => {
                                        let newPin = html.find("#new-pin-input").val();
                                        if (newPin) {
                                            await actor.setFlag('world', 'pinCode', newPin);
                                            ui.notifications.info('PIN-Code erfolgreich gesetzt.');
                                        } else {
                                            ui.notifications.error('Kein PIN eingegeben.');
                                        }
                                    }
                                },
                                cancel: {
                                    icon: "<i class='fas fa-times'></i>",
                                    label: "Abbrechen"
                                }
                            }
                        });
                        setPinDialog.render(true);
                    });
                
                    html.find('#change-pin').click(async () => {
                        if (!actor.getFlag('world', 'pinCode')) return;
                
                        let changePinDialog = new Dialog({
                            title: "PIN ändern",
                            content: `<p>Bitte gib einen neuen PIN-Code ein:</p>
                                      <input type="password" id="new-pin-input" placeholder="Neuen PIN-Code eingeben" autocomplete="off">`,
                            buttons: {
                                submit: {
                                    icon: "<i class='fas fa-check'></i>",
                                    label: "Speichern",
                                    callback: async (html) => {
                                        let newPin = html.find("#new-pin-input").val();
                                        if (newPin) {
                                            await actor.setFlag('world', 'pinCode', newPin);
                                            ui.notifications.info('PIN-Code erfolgreich geändert.');
                                        } else {
                                            ui.notifications.error('Kein PIN eingegeben.');
                                        }
                                    }
                                },
                                cancel: {
                                    icon: "<i class='fas fa-times'></i>",
                                    label: "Abbrechen"
                                }
                            }
                        });
                        changePinDialog.render(true);
                    });
                
                    html.find('#remove-pin').click(async () => {
                        if (!actor.getFlag('world', 'pinCode')) return;
                
                        let confirmationDialog = new Dialog({
                            title: "PIN entfernen",
                            content: `<p>Bist du sicher, dass du den PIN-Code entfernen möchtest? Dies wird den Schutz des Actor Sheets aufheben.</p>`,
                            buttons: {
                                confirm: {
                                    icon: "<i class='fas fa-check'></i>",
                                    label: "Ja, entfernen",
                                    callback: async () => {
                                        await actor.unsetFlag('world', 'pinCode');
                                        ui.notifications.info('PIN-Code erfolgreich entfernt.');
                                    }
                                },
                                cancel: {
                                    icon: "<i class='fas fa-times'></i>",
                                    label: "Abbrechen"
                                }
                            }
                        });
                        confirmationDialog.render(true);
                    });
                }
                
            }).render(true);
        });
    
        // Überprüfe, ob ein PIN-Code gesetzt ist und ob der Benutzer ein GM ist
        let pinCode = actor.getFlag('world', 'pinCode');
        let lastPinEntry = user.getFlag('world', `lastPinEntry_${actor.id}`); // Zeitstempel der letzten PIN-Eingabe für den einzelnen User und Actor
        let currentTime = Date.now();
    
        if (pinCode && !user.isGM) {
            // Überprüfen, ob die letzte PIN-Eingabe weniger als eine Minute zurückliegt
            if (!lastPinEntry || currentTime - lastPinEntry > 18000000) { // 60.000 ms = 1 Minute
                // Füge eine blockierende Überlagerung über das Actor Sheet hinzu, nur wenn der Benutzer kein GM ist
                let overlay = $(`<div class="pin-overlay" style="
                    position: absolute; 
                    top: 0; 
                    left: 0; 
                    width: 100%; 
                    height: 100%; 
                    background-color: rgba(255, 255, 255, 1); 
                    z-index: 1000; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center;
                    color: black;
                    font-size: 1.5em;
                    ">PIN-Code erforderlich</div>`);
    
                // Füge das Overlay dem Actor Sheet hinzu
                html.append(overlay);
    
                // PIN-Code Dialog öffnen
                let dialog = new Dialog({
                    title: "PIN-Code erforderlich",
                    classes: ["pin-input-field"],
                    content: `<p>Bitte gib deinen PIN-Code ein, um Zugriff auf das Character Sheet zu erhalten:</p><input type="password" id="pin-input" placeholder="PIN-Code eingeben">`,
                    buttons: {
                        submit: {
                            icon: "<i class='fas fa-check'></i>",
                            label: "Bestätigen",
                            callback: async (html) => {
                                let input = html.find("#pin-input").val();
                                if (input === pinCode) {
                                    ui.notifications.info('Zugriff gewährt.');
                                    // Entferne die Überlagerung, wenn der richtige PIN eingegeben wurde
                                    overlay.remove();
                                    // Speichere den aktuellen Zeitstempel als letzte PIN-Eingabe für diesen Benutzer und Actor
                                    await user.setFlag('world', `lastPinEntry_${actor.id}`, Date.now());
                                } else {
                                    ui.notifications.error('Falscher PIN-Code. Zugriff verweigert.');
                                    app.close(); // Schließe das Actor Sheet, wenn der PIN falsch ist
                                }
                            }
                        }
                    }
                });
                dialog.render(true);
            }
        }
    });
    
    
    
    


    Hooks.on("canvasReady", canvas => {
        canvas.hud.token = new ForbiddenLandsTokenHUD
    });
    Hooks.once('init', () => {
        game.settings.register('forbidden-lands', 'currentTimeIndex', {
            name: 'Current Time Index',
            scope: 'world',
            config: false,
            type: Number,
            default: 0
        });
    
        game.settings.register('forbidden-lands', 'toggleDarkness', {
            name: 'Toggle Darkness',
            scope: 'client',
            config: false,
            type: Boolean,
            default: true
        });
    });
    
})();






///day tracker
// Dynamically include the Material Icons stylesheet
const link = document.createElement('link');
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

const timesOfDay = ["Morgen", "Mittag", "Abend", "Nacht"];
const darknessLevels = {
    "Morgen": 0.2,
    "Mittag": 0.0,
    "Abend": 0.5,
    "Nacht": 1.0
};

const icons = {
    "Morgen": "wb_twilight",
    "Mittag": "wb_sunny",
    "Abend": "wb_twilight",
    "Nacht": "nights_stay"
};

Hooks.once('init', () => {
    game.settings.register('forbidden-lands', 'currentTimeIndex', {
        name: 'Current Time Index',
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    });

    game.settings.register('forbidden-lands', 'toggleDarkness', {
        name: 'Toggle Darkness',
        scope: 'client',
        config: false,
        type: Boolean,
        default: true
    });
});

async function updateTimeDisplay() {
    const currentTimeIndex = game.settings.get('forbidden-lands', 'currentTimeIndex');
    const currentTime = timesOfDay[currentTimeIndex];

    // Toggle 'active-time' class for the icons
    document.querySelectorAll(".time-icon").forEach((icon, index) => {
        if (index === currentTimeIndex) {
            icon.classList.add("active-time");
           
        } else {
            icon.classList.remove("active-time");
        }
    });

    // Update the time display text
    document.getElementById("current-time-display").innerText = `${currentTime}`;

    if (game.user.isGM) {
        const toggleDarkness = game.settings.get('forbidden-lands', 'toggleDarkness');
        if (toggleDarkness) {
            await updateSceneDarkness(darknessLevels[currentTime]);
        }
    }
}




async function setTimeIndex(newIndex) {
    // Setze den aktuellen Zeitindex in den Spieleinstellungen
    await game.settings.set('forbidden-lands', 'currentTimeIndex', newIndex);


    // Aktualisiere die Anzeige
    updateTimeDisplay(); // Stelle sicher, dass das UI aktualisiert wird
}



// Function to be called at the end of the day, only for actors controlled by users
// Function to be called at the end of the day, only for actors controlled by online users
async function endOfDayConsumablesCheck() {
    // Get the list of active users (online players)
    const onlineUsers = game.users.filter(user => user.active && user.character); // Only active users with a character

    // Get actors controlled by these users
    const actors = onlineUsers.map(user => user.character).filter(actor => actor); // Map users to their controlled actors

    let messageContent = `<h2>End of Day Summary</h2><p>The following player-controlled actors have rolled for their food and water consumption:</p><ul>`;

    for (const actor of actors) {
        const foodRolled = actor.getFlag('forbidden-lands', 'foodRolled');
        const waterRolled = actor.getFlag('forbidden-lands', 'waterRolled');

        messageContent += `<li><strong>${actor.name}</strong>: `;
        messageContent += `Food = ${foodRolled ? 'Yes' : 'No'}, `;
        messageContent += `Water = ${waterRolled ? 'Yes' : 'No'}</li>`;
    }

    messageContent += '</ul>';

    // Create a chat message with the summary
    ChatMessage.create({
        content: messageContent,
        speaker: { alias: "End of Day Report" }
    });

    // Reset the flags for the next day
    for (const actor of actors) {
        await actor.unsetFlag('forbidden-lands', 'foodRolled');
        await actor.unsetFlag('forbidden-lands', 'waterRolled');
    }
}

// Update the incrementDay function to call the endOfDayConsumablesCheck
async function incrementDay() {
    let currentDay = game.settings.get('forbidden-lands', 'currentDay');
    let currentMonthIndex = game.settings.get('forbidden-lands', 'currentMonth');
    let currentYear = game.settings.get('forbidden-lands', 'currentYear');

    const shelfLifeMapping = {
        "one day": 1,
        "day": 1,
        "one week": 7,
        "week": 7,
        "two weeks": 14,
        "one month": 45,
        "month": 45,
        "two months": 90,
        "one year": 360,
        "year": 360,
        "five years": 1800,
        "ten years": 3600
    };

    function handleShelfLife(item, itemsToDelete) {
        let shelfLife = item.system.shelfLife;
        if (shelfLife) {
            if (typeof shelfLife === "string") {
                shelfLife = shelfLifeMapping[shelfLife.toLowerCase()] || parseInt(shelfLife);
            }
            if (!isNaN(shelfLife)) {
                const newShelfLife = shelfLife - 1;
                if (newShelfLife <= 0) {
                    itemsToDelete.push(item);
                } else {
                    const newName = item.name.replace(/\(\d+ days\)$/, "").trim();
                    item.update({ "system.shelfLife": newShelfLife, "name": `${newName} (${newShelfLife} days)` });
                }
            }
        }
    }

    async function handleCriticalInjuries(actor) {
        let criticalInjuryMessages = [];
        for (let item of actor.items) {
            if (item.type === "criticalInjury" && item.system.healingTime.includes("days")) {
                let duration = parseInt(item.system.healingTime);
                duration--;
                
                if (duration <= 0) {
                    await actor.deleteEmbeddedDocuments("Item", [item.id]);
                    criticalInjuryMessages.push(`Critical Injury ${item.name} has fully healed and was removed.`);
                } else {
                    await item.update({ "system.healingTime": `${duration} days` });
                    criticalInjuryMessages.push(`Healing time for Critical Injury ${item.name} was reduced by 1 day. ${duration} days remaining.`);
                }
            }
        }

        if (criticalInjuryMessages.length > 0) {
            ChatMessage.create({
                content: criticalInjuryMessages.join("<br>"),
                speaker: { actor: actor }
            });
        }
    }

    async function handleProductionAndHirelings(actor) {
        let newItems = [];
        let hirelingCosts = { copper: 0, silver: 0, gold: 0 };
        let canPayHirelings = true;
        let buildingRoll = false;
        let totalHousing = 0; 
        let messageParts = []; 

        let food = ["Meat", "Fish", "Bread", "Vegetables", "Egg", "Eggs"];
        let hasFoodItem = actor.items.some(item => food.includes(item.name));

        let daysAlive = actor.system.daysalive || 0;
        await actor.update({
            "system.daysalive": daysAlive + 1
        });

        if ((daysAlive + 1) % 7 === 0) {
            messageParts.push("Made it through another day without any events, or did it...");
        }

        for (let item of actor.items) {
            let productionQuantity = parseInt(item.system.quantity);
            let shelfLife = item.system.shelfLife;

            if (item.type === "building" && item.name.includes("finished")) {
                let housing = parseInt(item.system.housing);
                if (!isNaN(housing)) {
                    totalHousing += housing * item.system.quantity;
                }
            }

            if (item.type === "building") {
                let buildingTime = item.system.time;

                if (typeof buildingTime !== 'number') {
                    buildingTime = shelfLifeMapping[buildingTime.toLowerCase()] || parseInt(buildingTime) || 0;
                }

                if (buildingTime > 0) {
                    await item.update({
                        "system.time": buildingTime - 1,
                        "name": `${item.name.split(" (")[0]} (${buildingTime - 1} day(s) left until finish)`
                    });
                } else {
                    await item.update({
                        "name": `${item.name.split(" (")[0]} (finished)`
                    });
                }

                if (buildingTime == 1) {
                    buildingRoll = true;
                }
            }

            if (item.type === "hireling") {
                if (item.system.salary.includes("Copper")) {
                    hirelingCosts.copper += parseInt(item.system.salary) * productionQuantity;
                }
                if (item.system.salary.includes("Silver")) {
                    hirelingCosts.silver += parseInt(item.system.salary) * productionQuantity;
                }
                if (item.system.salary.includes("Gold")) {
                    hirelingCosts.gold += parseInt(item.system.salary) * productionQuantity;
                }
                if (item.system.salary.includes("Housing")) {
                    totalHousing -= productionQuantity; 
                }
            }

            if (item.name.startsWith("Production")) {
                shelfLife = shelfLifeMapping[shelfLife.toLowerCase()] || parseInt(shelfLife);
                let newItemName = item.name.replace(/^Production\s*/, '');
                let existingItem = actor.items.find(i => i.name === newItemName);

                let maxQuantity = shelfLife * productionQuantity;

                if (existingItem) {
                    let existingQuantity = parseInt(existingItem.system.quantity);
                    let newQuantity = existingQuantity + productionQuantity;

                    if (newQuantity > maxQuantity) {
                        newQuantity = maxQuantity;
                    }

                    await existingItem.update({
                        "system.quantity": newQuantity
                    });
                } else {
                    let newItemData = duplicate(item);
                    newItemData.name = newItemName;
                    newItemData.system.quantity = Math.min(productionQuantity, maxQuantity);
                    newItems.push(newItemData);
                }
            }
        }

        await actor.update({
            "system.housing": totalHousing
        });

        for (let currency of ["copper", "silver", "gold"]) {
            let currencyValue = actor.system.currency[currency]?.value || 0;
            let cost = hirelingCosts[currency];
            if (cost > 0) {
                let newQuantity = Math.max(0, currencyValue - cost);
                await actor.update({ [`system.currency.${currency}.value`]: newQuantity });
                if (newQuantity === 0) {
                    canPayHirelings = false;
                }
            }
        }

        if (newItems.length > 0) {
            await actor.createEmbeddedDocuments("Item", newItems);
            messageParts.push(`New items created: ${newItems.map(i => i.name).join(", ")}.`);
        }

        if (buildingRoll) {
            messageParts.push("Building is ready. Make Crafting Roll.");
        }

        if (!canPayHirelings) {
            messageParts.push("Couldn't pay all hirelings.");
        } else {
            messageParts.push("Hirelings were paid.");
        }

        if (totalHousing < 0) {
            messageParts.push("Not enough housing available for hirelings.");
        }

        if (!hasFoodItem) {
            messageParts.push("No food left in the Stronghold.");
        }

        if (messageParts.length > 0 && actor.type === 'stronghold') {
            let messageContent = `<div class="forbidden-lands chat-item dice-roll">
                ${messageParts.map(part => `<p>${part}</p>`).join("")}
            </div>`;

            ChatMessage.create({ content: messageContent, speaker: { actor: actor } });
        }
    }

    let playerFolder = game.folders.find(folder => folder.name === "Spieler" && folder.type === "Actor");
    let strongholdFolder = game.folders.find(folder => folder.name === "Strongholds" && folder.type === "Actor");

    let players = playerFolder ? playerFolder.contents : [];
    let strongholds = strongholdFolder ? strongholdFolder.contents : [];

    async function processActors(actors) {
        for (let actor of actors) {
            let itemsToDelete = [];
            if (actor.type !== 'stronghold') {
                for (let actorItem of actor.items) {
                    handleShelfLife(actorItem, itemsToDelete);
                }
                if (itemsToDelete.length > 0) {
                    await actor.deleteEmbeddedDocuments("Item", itemsToDelete.map(item => item.id));
                }
            }
            await handleProductionAndHirelings(actor);
            await handleCriticalInjuries(actor); // Handle critical injuries here
        }
    }

    await processActors(players);
    await processActors(strongholds);

    currentDay++;
    if (currentDay > daysPerMonth) {
        currentDay = 1;
        currentMonthIndex++;
        if (currentMonthIndex >= months.length) {
            currentMonthIndex = 0;
            currentYear++;
        }
    }

    await game.settings.set('forbidden-lands', 'currentDay', currentDay);
    await game.settings.set('forbidden-lands', 'currentMonth', currentMonthIndex);
    await game.settings.set('forbidden-lands', 'currentYear', currentYear);

    updateDateDisplay();
    await endOfDayConsumablesCheck();
}









async function updateSceneDarkness(targetDarkness, duration = 1000) {
    const scene = game.scenes.active;
    if (!scene) return;

    const initialDarkness = scene.darkness;
    const difference = targetDarkness - initialDarkness;
    const stepTime = 5; // Interval time in ms
    const steps = duration / stepTime;
    const stepChange = difference / steps;

    let currentStep = 0;

    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            currentStep++;
            const newDarkness = initialDarkness + stepChange * currentStep;
            await scene.update({ darkness: newDarkness });

            if (currentStep >= steps) {
                clearInterval(interval);
                resolve();
            }
        }, stepTime);
    });
}

async function updateCheckboxState() {
    if (game.user.isGM) {
        const toggleDarkness = game.settings.get('forbidden-lands', 'toggleDarkness');
        document.getElementById("toggle-darkness").checked = toggleDarkness;
    }
}



Hooks.on('updateSetting', (setting) => {
    if (setting.key === 'forbidden-lands.currentTimeIndex') {
        updateTimeDisplay();
    }
});



//////////////////////////////////////////////


const months = ["SpringRise", "SpringWane", "SummerRise", "SummerWane", "FallRise", "FallWane", "WinterRise", "WinterWane"];
const daysPerMonth = 45;
const startingYear = 1165;

Hooks.once('init', () => {
    game.settings.register('forbidden-lands', 'currentDay', {
        name: 'Current Day',
        scope: 'world',
        config: false,
        type: Number,
        default: 1
    });

    game.settings.register('forbidden-lands', 'currentMonth', {
        name: 'Current Month',
        scope: 'world',
        config: false,
        type: Number,
        default: 0 // Index of the months array
    });

    game.settings.register('forbidden-lands', 'currentYear', {
        name: 'Current Year',
        scope: 'world',
        config: false,
        type: Number,
        default: startingYear
    });
});

async function updateDateDisplay() {
    const currentDay = game.settings.get('forbidden-lands', 'currentDay');
    const currentMonthIndex = game.settings.get('forbidden-lands', 'currentMonth');
    const currentYear = game.settings.get('forbidden-lands', 'currentYear');
    const currentMonth = months[currentMonthIndex];

    // Update the date display
    document.getElementById("current-date-display").innerText = `${currentDay}. ${currentMonth} ${currentYear}`;
}

async function setDate(day, monthIndex, year) {
    await game.settings.set('forbidden-lands', 'currentDay', day);
    await game.settings.set('forbidden-lands', 'currentMonth', monthIndex);
    await game.settings.set('forbidden-lands', 'currentYear', year);
    updateDateDisplay();
}

function openCalendar() {
    // Prüfen, ob der Modal-Dialog bereits existiert
    if (document.getElementById("calendar-modal")) return;

    // Erstelle ein Modal für die Datumsauswahl
    const modal = document.createElement("div");
    modal.id = "calendar-modal";
    modal.innerHTML = `
        <div class="calendar-container">
            <h2>Select Date</h2>
            <label for="calendar-day">Day:</label>
            <input type="number" id="calendar-day" min="1" max="${daysPerMonth}" value="${game.settings.get('forbidden-lands', 'currentDay')}" />
            <label for="calendar-month">Month:</label>
            <select id="calendar-month">
                ${months.map((month, index) => `<option value="${index}" ${index === game.settings.get('forbidden-lands', 'currentMonth') ? 'selected' : ''}>${month}</option>`).join('')}
            </select>
            <label for="calendar-year">Year:</label>
            <input type="number" id="calendar-year" value="${game.settings.get('forbidden-lands', 'currentYear')}" />
            <button id="save-date">Save</button>
            <button id="cancel-date">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Event-Listener für das Speichern und Schließen
    document.getElementById("save-date").addEventListener("click", async () => {
        const day = parseInt(document.getElementById("calendar-day").value);
        const monthIndex = parseInt(document.getElementById("calendar-month").value);
        const year = parseInt(document.getElementById("calendar-year").value);

        await setDate(day, monthIndex, year);

        // Schließe den Modal-Dialog
        document.body.removeChild(modal);
    });

    document.getElementById("cancel-date").addEventListener("click", () => {
        document.body.removeChild(modal);
    });
}


Hooks.on('ready', () => {
    const timeTracker = document.createElement('div');
timeTracker.id = 'time-tracker';
timeTracker.innerHTML = `
    <div id="time-wrapper" class="border" style="text-align: center; width: 100%;">
        <div class="time-controls">
            ${timesOfDay.map((time, index) => `
                <i class="material-icons time-icon" data-time-index="${index}">${icons[time]}</i>
            `).join('')}
            ${game.user.isGM ? '<label><input type="checkbox" id="toggle-darkness" checked></label>' : ''}
        </div>
        <div id="current-time-display" style="color: black; font-size: 14px; margin-top: 5px;">Current Time: Morning</div>
        <div style="display: flex; align-items: center; justify-content: center; margin-top: 5px;">
            <div id="current-date-display" style="color: black; font-size: 14px; cursor: pointer;">1. SpringRise 1165</div>
            <i class="material-icons" id="info-button" style="cursor: pointer; margin-left: 8px;">info</i>
        </div>
        <div id="forage-info" style="color: gray; font-size: 10px; margin-top: 5px;"></div> <!-- Forage info will be shown here -->
    </div>
`;
document.body.appendChild(timeTracker);

// Event listener for the info button
document.getElementById('info-button').addEventListener('click', () => {
    // Call the function to display whether players have rolled for food and water
    showConsumablesInfo();
});

// Function to display the food and water roll information for the current day
async function showConsumablesInfo() {
    // Get the list of active users (online players)
    const onlineUsers = game.users.filter(user => user.active && user.character); // Only active users with a character

    // Get actors controlled by these users
    const actors = onlineUsers.map(user => user.character).filter(actor => actor); // Map users to their controlled actors

    let messageContent = `<h2>Today's Consumables</h2><p>The following players have rolled for their food and water consumption:</p><ul>`;

    for (const actor of actors) {
        const foodRolled = actor.getFlag('forbidden-lands', 'foodRolled');
        const waterRolled = actor.getFlag('forbidden-lands', 'waterRolled');

        messageContent += `<li><strong>${actor.name}</strong>: `;
        messageContent += `Food = ${foodRolled ? 'Yes' : 'No'}, `;
        messageContent += `Water = ${waterRolled ? 'Yes' : 'No'}</li>`;
    }

    messageContent += '</ul>';

    // Display the message as a chat message
    ChatMessage.create({
        content: messageContent,
        speaker: { alias: "Daily Consumables Info" }
    });
}



    // Date click listener to open the calendar
    document.getElementById("current-date-display").addEventListener("click", () => {
        if (game.user.isGM) {
            openCalendar();
        }
    });

    // Ensure only GMs can click on the icons
    document.querySelectorAll(".time-icon").forEach(icon => {
        if (game.user.isGM) {
            icon.addEventListener("click", async (event) => {
                const newIndex = parseInt(event.currentTarget.getAttribute("data-time-index"));
    
                // Überprüfen, ob der Benutzer auf "Morgen" klickt (Index 0)
                if (newIndex === 0) {
                    // Öffne einen Bestätigungsdialog
                    new Dialog({
                        title: "Neuen Tag starten?",
                        content: "<p>Möchten Sie einen neuen Tag starten?</p>",
                        buttons: {
                            yes: {
                                icon: '<i class="fas fa-check"></i>',
                                label: "Ja",
                                callback: async () => {
                                    // Wenn "Ja", den Tag erhöhen und auf "Morgen" wechseln
                                    await incrementDay();
                                    await setTimeIndex(0); // Setze Zeit auf "Morgen"
                                }
                            },
                            no: {
                                icon: '<i class="fas fa-times"></i>',
                                label: "Nein",
                                callback: async () => {
                                    // Wenn "Nein", einfach auf "Morgen" wechseln
                                    await setTimeIndex(0); // Setze Zeit auf "Morgen"
                                }
                            }
                        },
                        default: "no"
                    }).render(true); // Korrekte Verwendung des Dialogs
                } else {
                    // Setze die Zeit, wenn nicht auf "Morgen" geklickt wurde
                    await setTimeIndex(newIndex);
                }
            });
        } else {
            icon.style.cursor = 'default'; // Nicht klickbar für Nicht-GMs
        }
    });
    

    if (game.user.isGM) {
        document.getElementById("toggle-darkness").addEventListener("change", async () => {
            const isChecked = document.getElementById("toggle-darkness").checked;
            await game.settings.set('forbidden-lands', 'toggleDarkness', isChecked);
        });
    }

    updateTimeDisplay();
    updateDateDisplay();
    updateCheckboxState();

    // Hide time tracker when combat starts, show when it ends
    Hooks.on('updateCombat', (combat) => {
        if (combat.started) {
            document.getElementById('time-tracker').style.display = 'none';
        } 
    });

    Hooks.on('deleteCombat', (combat) => {
        document.getElementById('time-tracker').style.display = 'flex';
    });

    // Listen for settings updates and refresh the time display when necessary
    Hooks.on('updateSetting', (setting) => {
        if (setting.key === 'forbidden-lands.currentTimeIndex') {
            updateTimeDisplay();
        } else if (
            setting.key === 'forbidden-lands.currentDay' ||
            setting.key === 'forbidden-lands.currentMonth' ||
            setting.key === 'forbidden-lands.currentYear'
        ) {
            updateDateDisplay();
        }
    });

    // Mapping der Monate zu den Forage-Werten
    const forageModifiers = {
        "SpringRise": -1,
        "SpringWane": -1,
        "SummerRise": 0,
        "SummerWane": 0,
        "FallRise": +1,
        "FallWane": +1,
        "WinterRise": -2,
        "WinterWane": -2
    };

    // Funktion zur Ermittlung der Forage-Information basierend auf dem aktuellen Monat
    function getForageInfo(month) {
        const forageModifier = forageModifiers[month];
        return `Forage: ${forageModifier}`;
    }

    // Funktion zur Aktualisierung der Forage-Information
    function updateForageInfo() {
        const currentMonthIndex = game.settings.get('forbidden-lands', 'currentMonth');
        const currentMonth = months[currentMonthIndex];
        const forageInfo = getForageInfo(currentMonth);

        // Aktualisiere das Forage-Info-Element
        const forageInfoElement = document.getElementById("forage-info");
        forageInfoElement.innerText = forageInfo;
    }

    // Call updateForageInfo when the page is loaded
    updateForageInfo();
    
    // Update forage info every time the date changes
    Hooks.on('updateSetting', (setting) => {
        if (setting.key === 'forbidden-lands.currentMonth') {
            updateForageInfo();
        }
    });
});



///day tracker


// class EventEmitter {
//     constructor() {
//         this.events = {};
//     }

//     on(event, listener) {
//         if (!this.events[event]) {
//             this.events[event] = [];
//         }
//         this.events[event].push(listener);
//     }

//     emit(event, args) {
//         if (this.events[event]) {
//             this.events[event].forEach(listener => listener(args));
//         }
//     }
// }

// const eventEmitter = new EventEmitter();



Hooks.on('getSceneControlButtons', controls => {
    // Suchen der Main Controls (meist die ersten Controls)
    let mainControls = controls.find(control => control.name === "token");

    if (mainControls) {
      // Neue Schaltfläche hinzufügen
      mainControls.tools.push({
        name: "x-card-button",
        title: "X Card",
        icon: "fa-solid fa-hand", // Font Awesome Icon
        button: true,
        onClick: () => {
          // Überprüfen, ob das Overlay bereits existiert
          let overlay = document.getElementById("blackout-overlay");
          if (!overlay) {
            // Erstellen des Overlay-Elements
            overlay = document.createElement("div");
            overlay.id = "blackout-overlay";
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.backgroundColor = "black";
            overlay.style.display = "flex";
            overlay.style.flexDirection = "column";
            overlay.style.justifyContent = "center";
            overlay.style.alignItems = "center";
            overlay.style.zIndex = "9999"; // Hoher Z-Index, um über allem zu liegen

            // Font Awesome Icon Hand hinzufügen
            const bigHand = document.createElement("i");
            bigHand.className = "fa-solid fa-x";
            bigHand.style.fontSize = "10rem"; // Größe des Icons
            bigHand.style.color = "white";
            bigHand.style.marginBottom = "20px"; // Abstand zu eventuell anderen Inhalten

            // Das Hand-Icon dem Overlay hinzufügen
            overlay.appendChild(bigHand);

            // Overlay zum Body hinzufügen
            document.body.appendChild(overlay);

            // Nach 5 Sekunden das Entfernen des Overlays durch Klick ermöglichen
            setTimeout(() => {
              overlay.addEventListener('click', () => {
                overlay.remove();
              });
            }, 5000); // 5 Sekunden Verzögerung
          } else {
            // Wenn das Overlay existiert, wird es entfernt
            overlay.remove();
          }
        },
        visible: true
      });
    }
});
