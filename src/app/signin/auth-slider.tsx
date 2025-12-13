'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide, Pagination, Autoplay } from '@core/ui/carousel/carousel';
import cn from '@core/utils/class-names';
import 'swiper/css';
import 'swiper/css/pagination';

const slides = [
    { image: '/slide-1.png' },
    { image: '/slide-2.png' },
    { image: '/slide-3.png' },
];

export default function AuthSlider({ className }: { className?: string }) {
    return (
        <div className={cn(
            'relative h-full w-full overflow-hidden rounded-[20px]',
            className
        )}>
            <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                speed={800}
                className="h-full w-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index} className="relative h-full w-full">
                        <Image
                            src={slide.image}
                            alt={`Slide ${index + 1}`}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
