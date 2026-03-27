/** Пресеты обложки для постов в ленте */
export const POST_GRADIENTS: { id: string; css: string; label: string }[] = [
  { id: 'mono', label: 'Моно', css: 'linear-gradient(160deg, #2a2a2a 0%, #f5f5f5 100%)' },
  { id: 'mist', label: 'Туман', css: 'linear-gradient(165deg, #ffffff 0%, #1c1c1c 85%)' },
  { id: 'steel', label: 'Сталь', css: 'linear-gradient(155deg, #eaeaea 0%, #0d0d0d 100%)' },
  { id: 'dusk', label: 'Сумерки', css: 'linear-gradient(170deg, #f8f8f8 10%, #252525 90%)' },
  { id: 'ink', label: 'Чернила', css: 'linear-gradient(135deg, #111 0%, #666 50%, #eee 100%)' },
  { id: 'snow', label: 'Снег', css: 'linear-gradient(180deg, #fff 0%, #9a9a9a 100%)' },
]

export function gradientById(id: string | undefined): string {
  const g = POST_GRADIENTS.find((x) => x.id === id)
  return g?.css ?? POST_GRADIENTS[0].css
}
