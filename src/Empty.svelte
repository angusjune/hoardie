<div class="empty">
    <figure class="empty__illustration">
        <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0)">
            <path d="M2 64.5H148" stroke="black"/>
            <path d="M99.5272 4.62856C95.568 4.69755 92.0921 8.90085 90.8437 13.6201C88.7368 21.5842 102.12 19.5056 104.56 29.647C107.61 42.3237 128.362 35.9507 131.749 27.4051C135.136 18.8595 125.834 12.6567 115.961 14.2432C106.087 15.8297 104.476 4.54232 99.5272 4.62856Z" stroke="#CFCFCF" stroke-width="2" stroke-dasharray="4 4"/>
            <path d="M45 37H105L115 52H35L45 37Z" fill="#FF720D"/>
            <g class="empty__illustration__tab2">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M58 19C55.7909 19 54 20.7909 54 23V57C54 59.2091 55.7909 61 58 61H98C100.209 61 102 59.2091 102 57V26H73V19H58Z" fill="#92EBFF"/>
            </g>
            <g class="empty__illustration__tab1">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M48 23C45.7909 23 44 24.7909 44 27V57C44 59.2091 45.7909 61 48 61H102C104.209 61 106 59.2091 106 57V30H63V23H48Z" fill="#5891FF"/>
            <path d="M62 40.5L50.5 52H94.5L78.5 36L68 46.5L62 40.5Z" fill="white"/>
            <circle cx="52" cy="36" r="4" fill="#FFB904"/>
            </g>
            <rect x="35" y="52" width="80" height="46" fill="#FFB904"/>
            <path d="M63.5 64.5H86.5V66C86.5 67.933 84.933 69.5 83 69.5H67C65.067 69.5 63.5 67.933 63.5 66V64.5Z" stroke="black"/>
            <path d="M2 46L6.375 28L23 40L2 46Z" fill="#CFCFCF"/>
            <circle cx="134" cy="72" r="6" fill="#CFCFCF"/>
            </g>
            <defs>
            <clipPath id="clip0">
            <rect width="150" height="100" fill="white"/>
            </clipPath>
            </defs>
        </svg>                                      
    </figure>
    <h1 class="empty__title" data-msg="empty_title">It's quiet here.</h1>
</div>

<style lang="scss">
    .empty {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-top: 25vh;

        &__illustration {
            margin: 0;

            &__tab1, &__tab2 {
                will-change: transform;
                transition: transform 0.16s ease-in;
            }

            &:hover {
                .empty__illustration__tab1 {
                    transition: transform 0.14s ease-out;
                    transform: translateY(-4px);
                }
                .empty__illustration__tab2 {
                    transition: transform 0.16s 0.04s ease-out;
                    transform: translateY(-8px);
                }
            }
        }

        &__title {
            margin: 32px 0 0;
            font-size: 18px;
            font-weight: 500;
        }
    }
</style>