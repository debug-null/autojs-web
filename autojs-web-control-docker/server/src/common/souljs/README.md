# [souljs](https://github.com/test/souljs)

A nodejs web framework, 对koa简单包装，装饰风格，内置开发常用中间件，使用typescript编写

## 快速开始

``` bash
git clone https://github.com/test/souljs-starter.git

npm install && npm run start
```
Node.js >= 8.0.0 required.


#### 创建应用实例

```typescript main.ts
import { createApplication } from 'souljs';
import * as router from './router';

async function main() {
  const app = await createApplication(__dirname, Object.keys(router).map(k => router[k]));

  app.listen(8080);
}

main();
```

#### 路由处理并返回数据

```typescript controller/user.ts
@Controller('/user')
export default class User {

  @Post('/chname')
  changeName() {
    return ‘hello world’;
  }
}
```

#### 通过@Render返回视图

```typescript controller/user.ts
@Controller('/user')
@Use(Auth())
export default class User {

  @Get()
  @Render('user')
  index() {
    return { content: 'hi' };
  }
}
```


#### 请求参数验证

```typescript
@Controller('/user')
@Role(SYS_ROLE.admin)
export default class User {

  @Post('/chname')
  @QuerySchame({
    username: joi.string().required(),
    password: joi.string().required(),
  })
  changeName(@Body() body: any, @Query() query: any) {
    return ResultUtils.ok(body);
  }
}

```

#### 接口描述

接口文档默认访问地址: /swagger-ui/index.html

```typescript
@Controller('/user')
@Description('用户信息')
export default class User {

  @Post('/hi')
  @Description('test')
  test() {}
}

```

#### 计划任务 @CronJob

使用修饰器@CronJob执行计划任务

```typescript
@Controller()
@Description('用户信息')
export default class User {

  @CronJob('* * * * * *', { onlyRunMaster: false }) // 多进程下是否只在master进程执行 default: true
  cron() {
    console.log('计划任务执行了！');
  }
}

```

## API

### createApplication(root, controllers, options): Application

- 参数
  - { string } root - 项目路径
  - { string | controller[] } controllers - 控制器的目录位置，使用globs匹配，或者是控制器类的数组
  - { ApplicationOptions }  options - 参考如下ApplicationOptions, 值false不启用功能

  ```typescript
    interface ApplicationOptions {
      staticAssets?: { root: string; prefix?: string } | boolean; // default: disable https://github.com/koajs/static
      swagger?: { url: string; prefix?: string } | boolean; // swagger-ui
      bodyparser?: Bodyparser.Options | boolean; // https://github.com/koajs/bodyparser
      cors?: object | boolean; // https://github.com/koajs/cors
      hbs?: { viewPath?: string } | boolean; // default: disable https://github.com/koajs/koa-hbs
      helmet?: object | boolean; // https://github.com/venables/koa-helmet
    }
  ```
- 返回值：Application


### Application

实例方法

- use(mid: Koa.Middleware)

- listen(port: number)

- getKoaInstance(): Koa

- getHttpServer(): http.Server


### http请求装饰器

内部使用koa-router中间件，提供对应的方法的装饰器

- @Controller(string|void)

- @POST(string|void)

- @Get(string|void)

### @Render(view: string) 模板渲染


### 使用[Joi](https://www.npmjs.com/package/joi)验证请求参数

- BodySchame(schame: joi.AnySchema)

- QuerySchame(schame: joi.AnySchema)


### 控制器处理方法参数注入

```typescript
@Post('/test')
test(@Body() Body: any, @Query() query: any) {}
  
 ```

 
### 自定义装饰器

```typescript
import { Use, Description } from 'souljs';
export default function Role(...roles: string[]) {
  const role = Use(async (ctx: Koa.Context, next: () => void) => {
    const sql = `
      SELECT R.code FROM role R
      LEFT JOIN user_roles UR ON UR.role_id = R.id
      WHERE UR.user_id = ?
    `;
    const userRoles = await db.query(sql, [signData.id]);
    if (roles.some(r => userRoles.find(ur => ur.code === r))) {
      await next();
    } else {
      throw new Error('no authorization!');
    }
  });

  const description = Description(`【${roles.join()}】`);

  return (target: any, propertyKey?: string) => {
    role(target, propertyKey);
    description(target, propertyKey);
  };
}  

// 使用装饰器
@Controller('/system/role')
@Role(SYS_ROLE.admin)
export class RoleController {
  @Get('/list')
  @Description('角色列表')
  async list() { }
}
 ```
 
 提供如下修饰器

- @Ctx() - ctx
- @Request() - ctx.request
- @Response() - ctx.Response
- @Query(string|void) - ctx.request.query[string] | ctx.request.query
- @Body(string|void) - ctx.request.body[string] | ctx.request.body

- @ApplicationInstance() - 当前应用实例
- @KoaInstance() - 当前koa实例
