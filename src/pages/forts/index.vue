<template>
    <div>
        <div class="flex justify-center p-4 pb-2">
            <a-typography-title :level="5">可喜可贺，全服总共击杀 <span class="text-red">{{ total }}</span>
                个城寨！
            </a-typography-title>
            <a-button type="primary" @click="message.success(getSupportMsg())" class="align-end">为544助力</a-button>
        </div>
        <div class="flex justify-center gap-2 p-2 pb-0 pt-0">
            <a-range-picker v-model:value="dateRange" @change="handleDateRangeChange" />
            <a-input v-model:value="usernameSearchKey" placeholder="输入姓名过滤" style="width: 200px;" />
        </div>
        <a-alert banner message="时间范围为开始日期的23:59:59至结束日期的23:59:59" />
        <a-collapse v-model:activeKey="activeKey">
            <a-collapse-panel :key="user.name" v-for="(user, i) in filteredLogs">
                <template #header>
                    <div class='flex item-center' :style="`${i < 3 && 'line-height:30px'}`">
                        <span v-if="user.rank === 0" style="color:gold;font-size: 24px;">
                            🏆冠军
                        </span>
                        <span v-if="user.rank === 1" style="color: silver;font-size: 24px;">
                            🥈亚军
                        </span>
                        <span v-if="user.rank === 2" style="color:chocolate;font-size: 24px;">
                            🥉季军
                        </span>
                        <div class="text-red font-bold"
                            :class="[user.rank < 3 && 'animate-rubber-band animate-count-infinite animate-duration-1s text-2xl']">
                            {{
                                user.name
                            }}</div>
                        <span>成功击杀了</span>
                        <span class="text-purple font-bold">{{ user.total }}</span>
                        <span>个城寨</span>
                    </div>
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
    <a-alert banner :message="`最新击杀寨子记录为：${lastestLog?.content} ${lastestLog?.created_at}`" />
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { getForts } from "@/api/request";
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)
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
const dateRange = ref([])
const usernameSearchKey = ref('')

async function fetchForts() {
    list.value = await getForts()
    processData(list.value)
}


function ifUserFortCreateAtTimeTooClose(newFort: Fort, forts: Set<Fort>) {
    let tooClose = false
    forts.forEach((item) => {
        // a same user cannot create fort attact 2 times within 5 second
        if (Math.abs(dayjs(item.created_at).diff(newFort.created_at, 'second')) < FORT_TIME_DIFF) {
            tooClose = true
        }
    })
    return tooClose
}

function processData(list: Fort[], range?: string[] | null) {
    let _list = list
    // filter time
    if (range && range.length > 0) {
        const [t1, t2] = range
        const start = t1.endOf('day')
        const end = t2.endOf('day')
        // console.log(dayjs(_list[0].created_at).format('YYYY-MM-DD HH:mm:ss'), start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss'))
        _list = _list.filter(item => dayjs(item.created_at).isBetween(start, end))
        console.log('time filter list result:', _list)
    }
    let _filteredList = _list.filter(item => KEYWORDS.some(kwd => item.content.includes(kwd)))
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

    return arr.sort((a, b) => b.total - a.total).map((item, index) => ({ ...item, rank: index }))
})

const filteredLogs = computed(() => {
    if (!usernameSearchKey.value) return logs.value
    return logs.value.filter(item => item.name.includes(usernameSearchKey.value))
})

const total = computed(() => {
    return logs.value.reduce((prev, next) => prev + next.total, 0)
})

const lastestLog = computed(() => {
    if (!list.value || list.value.length === 0) return { content: 'none', created_at: 'none' }
    return list.value[list.value.length - 1]
})

function handleDateRangeChange(range: string[]) {
    userFortsMap.value = new Map()
    console.log(userFortsMap.value, range)
    processData(list.value, range)
}
function getSupportMsg() {
    const idx = Number(Math.random() * 3).toFixed(0)
    return ['牛逼牛逼！', '无敌！', '你可真是个老六！', '奖励一个美女！', '龙王驾到！'].find((item, i) => `${i}` === idx)
}
onMounted(() => {
    fetchForts()
})
</script>

<style scoped></style>