import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { PublishedCheckIn } from "../types/app";
import { buildCalendarCells } from "../lib/calendar";

interface Props {
  month: Date;
  checkins: PublishedCheckIn[];
  selectedDate: string;
  onSelectDate(date: string): void;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function DrinkCalendar({ month, checkins, selectedDate, onSelectDate }: Props) {
  const cells = buildCalendarCells(month.getFullYear(), month.getMonth());
  const byDate = new Map<string, PublishedCheckIn[]>();
  for (const checkin of checkins) {
    const records = byDate.get(checkin.consumed_on) ?? [];
    records.push(checkin);
    byDate.set(checkin.consumed_on, records);
  }

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((weekday) => <Text key={weekday} style={styles.weekday}>{weekday}</Text>)}
      </View>
      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell) return <View key={`empty-${index}`} style={styles.cell} />;
          const records = byDate.get(cell.date) ?? [];
          const first = records[0];
          const selected = selectedDate === cell.date;
          return (
            <Pressable
              key={cell.date}
              onPress={() => onSelectDate(cell.date)}
              style={[styles.cell, selected && styles.selectedCell]}
            >
              <Text style={[styles.day, selected && styles.selectedDay]}>{cell.day}</Text>
              {first ? (
                <View style={styles.thumbWrap}>
                  <Image source={{ uri: first.image_url }} style={styles.thumb} alt={`${first.drink_name}照片`} />
                  {records.length > 1 ? <Text style={styles.count}>+{records.length - 1}</Text> : null}
                </View>
              ) : <View style={styles.emptyThumb} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: { height: 28, flexDirection: "row", alignItems: "center" },
  weekday: { width: "14.2857%", textAlign: "center", color: "#7A847D", fontSize: 11, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", height: 70, paddingHorizontal: 2, paddingVertical: 3, alignItems: "center" },
  selectedCell: { backgroundColor: "#E7F0E9" },
  day: { height: 17, color: "#59645D", fontSize: 10, fontWeight: "700" },
  selectedDay: { color: "#2F6B49", fontWeight: "900" },
  thumbWrap: { width: "100%", flex: 1, position: "relative" },
  thumb: { width: "100%", height: "100%", borderRadius: 4, backgroundColor: "#E3E7E2" },
  emptyThumb: { width: "100%", flex: 1, borderRadius: 4, backgroundColor: "#F0F2EF" },
  count: { position: "absolute", right: 2, bottom: 2, minWidth: 17, height: 17, borderRadius: 8, overflow: "hidden", backgroundColor: "#24332A", color: "#FFFFFF", textAlign: "center", fontSize: 9, lineHeight: 17, fontWeight: "800" },
});
