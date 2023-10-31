import { TrustScoreKeyEnum } from "@/data";

export type TrustScoreKey = keyof typeof TrustScoreKeyEnum;

export type TrustScoreInfo = {
    index: number
    title: string
    description: string
    score: number | undefined
}