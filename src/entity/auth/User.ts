import { BaseEntity } from '../Base.entity';

/**
 * Created by wh on 2020/8/31
 * author: wanghao
 * @desc：用户
 */
export class User extends BaseEntity {

    /**
     * 对应角色
     */
    public roles: string = '';
    /**
     * 用户名
     */
    public name: string = '';
    /**
     * 密码
     */
    public password: string = '';
    /**
     * 邮箱
     */
    public email: string = "";
    /**
     * 权限名称
     */
    public rolesName: string = '';
}
