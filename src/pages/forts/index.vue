<template>
    <div>
        <div class="flex justify-center p-4 pb-2">
            <a-typography-title :level="5">可喜可贺，全服总共击杀 <span class="text-red">{{ total }}</span>
                个城寨！
                <span v-if="list.length > 0" class="text-gray text-center" style="font-size: 12px;">记录从{{
                    dayjs(list[0].created_at).startOf('day').format('YYYY年MM月DD日') }}开始</span>
            </a-typography-title>
            <a-button type="primary" @click="message.success(getSupportMsg())" class="align-end">为544助力</a-button>
        </div>
        <div class="flex justify-center items-center flex-wrap gap-2 p-2 pb-0 pt-0">
            <a-range-picker v-model:value="dateRange" @change="handleDateRangeChange" />
            <a-select v-model:value="usernameSearchKeys" placeholder="输入姓名过滤"
                :options="allUserNames.map(v => ({ label: v, value: v }))" mode="multiple" style="width: 200px;"
                :allowClear="true" />
            <div>
                <a-checkbox v-model:checked="merged">数据聚合</a-checkbox>
                <a-popover placement="leftBottom" trigger="click">
                    <template #content>
                        <p>用法举例</p>
                        <p style="max-width: 300px;">
                            【\點一根煙】和【、點一根煙】本是同人同号，由于图片识文无法100%准确，所以可以在姓名过滤输入框选择【\點一根煙】和【、點一根煙】，然后点击数据聚合，可以将两条数据合并为同一个账号下的数据。
                        </p>
                        <p>手机上使用会卡顿，请耐心等待计算结果。</p>
                    </template>
                    <template #title>
                        <span>数据聚合</span>
                    </template>
                    <QuestionCircleFilled class="text-yellow" />
                </a-popover>
            </div>
        </div>
        <a-alert banner message="时间范围为开始日期的23:59:59至结束日期的23:59:59" class="mt-2" />
        <a-collapse v-model:activeKey="activeKey" class="mt-2">
            <a-collapse-panel :key="user.name" v-for="(user, i) in filteredLogs">
                <template #header>
                    <div class='flex item-center' :style="`${i < 3 && 'line-height:30px'}`">
                        <span v-if="user.rank === 0" style="color:gold;font-size: 24px;">
                            <img :src="throphyGold" class="throphy" />
                        </span>
                        <span v-if="user.rank >= 1 && user.rank <= 2" s>
                            <img :src="throphyPurple" class="throphy" />
                        </span>
                        <span v-if="user.rank >= 3 && user.rank <= 7">
                            <img :src="throphyBlue" class="throphy" />
                        </span>
                        <span v-if="user.rank >= 8 && user.rank <= 17">
                            <img :src="throphyGreen" class="throphy" />
                        </span>
                        <div
                            :class="[user.rank < 3 && 'animate-rubber-band animate-count-infinite animate-duration-1s text-2xl']">
                            <span v-if="user.rank > 2" class="ml-1">{{ i + 1 }}. </span>
                            <span class="font-bold text-red">{{ user.name }}</span>
                        </div>
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
        <div v-if="filteredLogs.length === 0" style="min-height: 80vh;" class="pt-10">
            <a-empty />
        </div>
    </div>
    <a-alert banner :message="`最新击杀寨子记录为：${lastestLog?.content} ${lastestLog?.created_at}`" />
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { getForts } from "@/api/request";
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)
const ATTACK_SPLIT_WORD = '对'
const CANCEL_SPLIT_WORD = '取消了'
const ATTACK_KEYWORDS = ['对等级', '对野蛮人']
const CANCEL_KEYWORDS = ['取消了']
const KEYWORDS = [...ATTACK_KEYWORDS, ...CANCEL_KEYWORDS]
const FORT_TIME_DIFF = 5// a same user's fort considers as same if their diff is within 5 second
import throphyGold from '@/assets/image/gold.jpg'
import throphyPurple from '@/assets/image/purple.jpg'
import throphyBlue from '@/assets/image/blue.jpg'
import throphyGreen from '@/assets/image/green.jpg'

interface Fort {
    content: string, created_at: string
}
const list = ref<Fort[]>([])
const userFortsMap = ref(new Map())
const activeKey = ref('')
const dateRange = ref([])
const usernameSearchKeys = ref([])
const merged = ref(false)//

async function fetchForts() {
    list.value = await getForts()
    userFortsMap.value = new Map()
    processData(list.value, dateRange.value)
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
    let _list = list.slice(0).reverse()
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
    console.log(9393939, _filteredList)
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
const allUserNames = computed(() => logs.value.map(item => item.name))

const filteredLogs = computed(() => {
    if (usernameSearchKeys.value.length === 0) return logs.value
    return logs.value.filter(item => {
        return usernameSearchKeys.value.some(name => item.name.includes(name))
    })
})

function mergeData() {
    let _list: Fort[] = []
    filteredLogs.value.forEach(item => {
        item.attack.forEach(v => {
            const textAfterUsername = v.content.split(ATTACK_SPLIT_WORD)[1]
            _list.push({ content: `${usernameSearchKeys.value[0]}${ATTACK_SPLIT_WORD}${textAfterUsername}`, created_at: v.created_at })
        })
        item.cancel.forEach(v => {
            const textAfterUsername = v.content.split(CANCEL_SPLIT_WORD)[1]
            _list.push({ content: `${usernameSearchKeys.value[0]}${CANCEL_SPLIT_WORD}${textAfterUsername}`, created_at: v.created_at })
        })
    })
    userFortsMap.value = new Map()
    processData(_list.slice(0).reverse(), dateRange.value)
}

watch(merged, () => {
    if (merged.value) {
        mergeData()
    } else {
        fetchForts()
    }
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
    const idx = Number(Math.random() * 4).toFixed(0)
    return ['牛逼牛逼！', '无敌！', '你可真是个老六！', '奖励一个美女！', '龙王驾到！'].find((item, i) => `${i}` === idx)
}
onMounted(() => {
    fetchForts()
})
</script>

<style scoped>
.throphy {
    width: 30px;
    border-radius: 50px;
}
</style>