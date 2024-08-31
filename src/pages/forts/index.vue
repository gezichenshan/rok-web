<template>
    <div>
        <div class="text-center p-4 pb-0">
            <a-typography-title :level="4">可喜可贺，全服总共击杀 <span class="text-red">{{ total }}</span>
                个城寨！
            </a-typography-title>
        </div>
        <div class="text-end mb-4">
            <a-button type="primary" @click="message.success('牛逼牛逼！')" class="align-end">为544助力</a-button>
        </div>
        <a-collapse v-model:activeKey="activeKey">
            <a-collapse-panel :key="user.name" v-for="user in logs">
                <template #header>
                    <span class="text-red font-bold">{{ user.name }}</span>
                    <span>成功击杀了</span>
                    <span class="text-purple font-bold">{{ user.total }}</span>
                    <span>个城寨</span>
                </template>
                <div>
                    <span class='text-green'>发起记录</span> ：{{ user.attack.length }}
                    <div v-for="item in user.attack">
                        {{ item.content }} {{ item.created_at }}
                    </div>
                </div>
                <div class="mt-2">
                    <span class='text-orange'>取消记录</span>：{{ user.cancel.length }}
                    <div v-for="item in user.cancel">
                        {{ item.content }} {{ item.created_at }}
                    </div>
                </div>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { getForts } from "@/api/request";
const ATTACK_SPLIT_WORD = '对等级'
const CANCEL_SPLIT_WORD = '取消了'
const ATTACK_KEYWORDS = ['对等级5', '对等级4']
const CANCEL_KEYWORDS = ['取消了']
const KEYWORDS = [...ATTACK_KEYWORDS, ...CANCEL_KEYWORDS]
const FORT_TIME_DIFF = 5// a same user's fort considers as same if their diff is within 5 second

interface Fort {
    content: string, created_at: string
}
const list = ref<Fort[]>([])
const userFortsMap = ref(new Map())
const activeKey = ref('')

async function fetchForts() {
    list.value = await getForts()
    processData(list.value)
}


function ifUserFortCreateAtTimeTooClose(newFort: Fort, forts: Set<Fort>) {
    let tooClose = false
    forts.forEach((item) => {
        // a same user cannot create fort attact 2 times within 5 second
        console.log(Math.abs(dayjs(item.created_at).diff(newFort.created_at, 'second')), newFort.content, newFort.created_at)
        if (Math.abs(dayjs(item.created_at).diff(newFort.created_at, 'second')) < FORT_TIME_DIFF) {
            tooClose = true
        }
    })
    return tooClose
}

function processData(list: Fort[]) {
    const _filteredList = list.filter(item => KEYWORDS.some(kwd => item.content.includes(kwd)))
    _filteredList.forEach((item) => {
        if (item.content.includes(ATTACK_SPLIT_WORD)) {
            const username = item.content.split(ATTACK_SPLIT_WORD)[0]
            if (!username) return
            let user: Map<'attack' | 'cancel', Set<Fort>> = userFortsMap.value.get(username)
            if (!user) {
                user = new Map()
                user.set('attack', new Set())
                user.set('cancel', new Set())
                userFortsMap.value.set(username, user)
            }
            let userAttacks = user.get('attack')!
            if (!ifUserFortCreateAtTimeTooClose(item, userAttacks)) {
                userAttacks.add(item)
            }
        }
        if (item.content.includes(CANCEL_SPLIT_WORD)) {
            const username = item.content.split(CANCEL_SPLIT_WORD)[0]
            if (!username) return
            let user: Map<'attack' | 'cancel', Set<Fort>> = userFortsMap.value.get(username)
            if (!user) {
                user = new Map()
                user.set('attack', new Set())
                user.set('cancel', new Set())
                userFortsMap.value.set(username, user)
            }
            let userCancels = user.get('cancel')!
            if (!ifUserFortCreateAtTimeTooClose(item, userCancels)) {
                userCancels.add(item)
            }
        }
    })
    console.log('userFortsMap.value', userFortsMap.value)

}

const logs = computed(() => {
    const users = userFortsMap.value.keys()
    const arr = []
    for (const user of users) {
        const attack = Array.from(userFortsMap.value.get(user).get('attack'))
        const cancel = Array.from(userFortsMap.value.get(user).get('cancel'))
        arr.push({
            name: user,
            attack: attack,
            cancel: cancel,
            total: attack.length - cancel.length
        })
    }

    return arr.sort((a, b) => b.total - a.total)
})

const total = computed(() => {
    return logs.value.reduce((prev, next) => prev + next.total, 0)
})

onMounted(() => {
    fetchForts()
})
</script>

<style scoped></style>
