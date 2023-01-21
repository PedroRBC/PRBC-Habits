import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { BackButton } from "../components/BackButton";
import { generateProgress } from '../utils/generate-progress'
import dayjs from 'dayjs'
import { PorgressBar } from "../components/ProgressBar";
import { CheckBox } from "../components/CheckBox";
import { api } from "../lib/axios";
import { Loading } from "../components/Loading";
import { HabitsEmpty } from "../components/HabitsEmpty";
import clsx from "clsx";

interface Params {
    date: string;
}

interface HabitsInfo {
    possibleHabits: {
        id: string,
        title: string,
        created_at: string,
    }[],
    completedHabits: string[]
}

export function Habit() {
    const [loading, setLoading] = useState(true)
    const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>()
    const [completedHabits, setCompltedHabits] = useState<string[]>([]);

    const route = useRoute();
    const { date } = route.params as Params;

    const parsedDate = dayjs(date)
    const isPastDate = parsedDate.endOf('day').isBefore(new Date())
    const dayOfWeek = parsedDate.format('dddd')
    const dayAndMonth = parsedDate.format('DD/MM')

    const habitsProgress = habitsInfo?.possibleHabits.length ? generateProgress(habitsInfo.possibleHabits.length, completedHabits.length) : 0

    async function fetchHabit() {
        try {
            setLoading(true);

           await api.get('day', {
                params: {
                    date
                }
            }).then(res => {
                setHabitsInfo(res.data)
                setCompltedHabits(res.data.completedHabits)
            })

        } catch (err) {
            console.error(err)
            Alert.alert('Ops', 'Não foi possível carregar o hábito')
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleHabit(habitId: string) {
        try {
            await api.patch(`/habits/${habitId}/toggle`)
        if (completedHabits.includes(habitId)) {
            setCompltedHabits(prevState => prevState.filter(habit => habit !== habitId))
        } else {
            setCompltedHabits(prevState => [...prevState, habitId])
        }
            
        } catch (err) {
            console.error(err)
            Alert.alert('Ops', 'Não foi possível atualizar o Hábito.')
            
        }
    }

    useEffect(() => {
        fetchHabit()
    }, [])

    if (loading) {
        return <Loading />
    }

    return (
        <View className="flex-1 bg-background px-8 pt-16">
                        <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 100}}
            >
                <BackButton />

                <Text className="mg-6 text-zinc-400 font-semibold text-base lowercase">
                    {dayOfWeek}
                </Text>
                
                <Text className="text-white font-extrabold text-3xl">
                    {dayAndMonth}
                </Text>

                <PorgressBar progress={habitsProgress} />      

                <View className={clsx("mt-6", {
                    ["opacity-40"]: isPastDate
                })}>
                    {
                        habitsInfo?.possibleHabits ?
                        habitsInfo.possibleHabits.map(habit => <CheckBox
                            key={habit.id}
                            title={habit.title}
                            onPress={() => { handleToggleHabit(habit.id) }}
                            disabled={isPastDate}
                            checked={completedHabits.includes(habit.id)} />) : <HabitsEmpty />
                    }
                </View>    
                {
                    isPastDate && <Text className="text-white text-lg mt-10 text-center" >
                        So é possível atualizar os hábitos da data atual.
                    </Text>
                }
            </ScrollView>

        </View>
    )
}