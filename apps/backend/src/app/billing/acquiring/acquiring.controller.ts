/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { AcquiringService } from './acquiring.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AcquiringDepositWebhookDto, AcquiringErrorWebhookDto, AcquiringWithdrawRequestDto, AcquiringWithdrawWebhookDto } from '@trinity/shared';

@ApiTags('Acquiring')
@ApiBearerAuth('access_token')
@UseGuards(JWTAuthGuard)
@Controller('acquiring')
export class AcquiringController {
  constructor(private readonly acquiringService: AcquiringService) {}

  // -------------------------
  // Получение адреса для пополнения
  // -------------------------
  @Get('deposit-address')
  @ApiOperation({ summary: 'Получить адрес для пополнения' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает адрес депозитного кошелька пользователя',
  })
  async getDepositAddress(@UserId() userId: number) {
    let account;

    try {
      account = await this.acquiringService.getAccount(userId.toString());
    } catch (err: any) {
      // Если кошелька нет — создаём
      if (err?.response?.status === 404) {
        account = await this.acquiringService.createAccount(userId.toString());
      } else {
        throw err;
      }
    }

    return { address: account.address };
  }

  // -------------------------
  // Вывод средств
  // -------------------------
  @Post('withdraw')
  @ApiOperation({ summary: 'Вывести средства на указанный адрес' })
  @ApiBody({ type: AcquiringWithdrawRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Средства успешно выведены',
  })
  async withdraw(
    @UserId() userId: number,
    @Body() dto: AcquiringWithdrawRequestDto
  ) {
    let account;

    // Проверяем кошелек
    try {
      account = await this.acquiringService.getAccount(userId.toString());
    } catch (err: any) {
      if (err?.response?.status === 404) {
        account = await this.acquiringService.createAccount(userId.toString());
      } else {
        throw err;
      }
    }


    // Выполняем вывод
    await this.acquiringService.withdraw(dto.address, dto.amount);

    return { success: true };
  }

  // -------------------------
  // Вебхуки
  // -------------------------

    @Post('webhook/deposit')
  @ApiOperation({ summary: 'Входящее уведомление о депозите' })
  @ApiBody({ type: AcquiringDepositWebhookDto })
  async handleDepositWebhook(@Body() body: AcquiringDepositWebhookDto) {
    return this.acquiringService.handleDeposit(body);
  }

  @Post('webhook/withdraw')
  @ApiOperation({ summary: 'Входящее уведомление о выводе' })
  @ApiBody({ type: AcquiringWithdrawWebhookDto })
  async handleWithdrawWebhook(@Body() body: AcquiringWithdrawWebhookDto) {
    return this.acquiringService.handleWithdraw(body);
  }

  @Post('webhook/insufficient-balance')
  @ApiOperation({ summary: 'Входящее уведомление о недостаточном балансе' })
  @ApiBody({ type: AcquiringErrorWebhookDto })
  async handleInsufficientBalanceWebhook(@Body() body: AcquiringErrorWebhookDto) {
    return this.acquiringService.handleInsufficientBalance(body);
  }

  @Post('webhook/runtime-error')
  @ApiOperation({ summary: 'Входящее уведомление о runtime ошибке' })
  @ApiBody({ type: AcquiringErrorWebhookDto })
  async handleRuntimeErrorWebhook(@Body() body: AcquiringErrorWebhookDto) {
    return this.acquiringService.handleRuntimeError(body);
  }
}
