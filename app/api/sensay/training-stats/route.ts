import { NextRequest, NextResponse } from "next/server"

// Получаем переменные окружения
const apiKey = process.env.SENSAY_API_KEY
const orgId = process.env.SENSAY_ORG_ID
// Корректно обрабатываем базовый URL API
const sensayApiBase = process.env.SENSAY_REPLICA_API ? 
  process.env.SENSAY_REPLICA_API.replace(/\/replicas$/, "") : 
  "https://api.sensay.io/v1"

export async function GET(request: NextRequest) {
  try {
    if (!apiKey || !orgId) {
      return NextResponse.json(
        { error: "API key or Organization ID not configured" },
        { status: 500 }
      )
    }

    // Получение параметров запроса
    const searchParams = request.nextUrl.searchParams
    const replicaUUID = searchParams.get("replicaUUID")

    if (!replicaUUID) {
      return NextResponse.json(
        { error: "Replica UUID is required" },
        { status: 400 }
      )
    }

    // Запрос к Sensay API для получения статистики тренировок
    const statsUrl = `${sensayApiBase}/replicas/${replicaUUID}/stats`
    
    console.log(`API Key: ${apiKey ? 'Present' : 'Missing'}`)
    console.log(`Organization ID: ${orgId ? 'Present' : 'Missing'}`)
    console.log(`Base URL: ${sensayApiBase}`)

    console.log(`Fetching training stats from: ${statsUrl}`)

    const statsResponse = await fetch(statsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-ORGANIZATION-SECRET": apiKey
      }
    })

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text()
      console.error(`Error fetching training stats: ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch training stats: ${statsResponse.statusText}` },
        { status: statsResponse.status }
      )
    }

    const statsData = await statsResponse.json()

    // Возвращаем данные статистики
    return NextResponse.json(statsData)
  } catch (error) {
    console.error("Error in training stats API:", error)
    return NextResponse.json(
      { error: "Failed to fetch training statistics" },
      { status: 500 }
    )
  }
}
